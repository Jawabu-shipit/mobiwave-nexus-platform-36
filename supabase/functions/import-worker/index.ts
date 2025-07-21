import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ImportJob {
  id: string
  user_id: string
  model_id: string
  file_url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_records?: number
  processed_records?: number
  error_message?: string
  created_at: string
  updated_at: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    if (path === '/import-worker/jobs' && method === 'POST') {
      const body = await req.json()
      return await createImportJob(user.id, body)
    } else if (path === '/import-worker/jobs' && method === 'GET') {
      return await getImportJobs(user.id)
    } else if (path.startsWith('/import-worker/jobs/') && method === 'GET') {
      const jobId = path.split('/')[3]
      return await getImportJob(user.id, jobId)
    } else if (path === '/import-worker/process' && method === 'POST') {
      const body = await req.json()
      return await processImportJob(body.job_id)
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = (error instanceof Error) ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function createImportJob(userId: string, jobData: { model_id: string, file_url: string, file_type: string }) {
  // Create import job record
  const { data: job, error } = await supabase
    .from('import_jobs')
    .insert([{
      user_id: userId,
      model_id: jobData.model_id,
      file_url: jobData.file_url,
      file_type: jobData.file_type,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) throw error

  // No immediate processing here; background worker will pick up the job
  return new Response(
    JSON.stringify(job),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getImportJobs(userId: string) {
  const { data, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getImportJob(userId: string, jobId: string) {
  const { data, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('user_id', userId)
    .eq('id', jobId)
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}



export async function processImportJob(jobId: string) {
  try {
    // Update job status to processing
    await supabase
      .from('import_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId)

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    // Get model details
    const { data: model, error: modelError } = await supabase
      .from('data_models')
      .select('*')
      .eq('id', job.model_id)
      .single()

    if (modelError || !model) {
      throw new Error('Model not found')
    }

    // Download and parse file
    const fileData = await downloadAndParseFile(job.file_url, job.file_type)
    
    // Validate data against model schema
    const validatedData = validateDataAgainstModel(fileData, model)

    // Insert records in batches
    const batchSize = 100
    let processedCount = 0

    for (let i = 0; i < validatedData.length; i += batchSize) {
      const batch = validatedData.slice(i, i + batchSize)
      
      const recordsToInsert = batch.map(record => ({
        user_id: job.user_id,
        model_id: job.model_id,
        data: record
      }))

      const { error: insertError } = await supabase
        .from('records')
        .insert(recordsToInsert)

      if (insertError) {
        throw new Error(`Failed to insert batch: ${insertError.message}`)
      }

      processedCount += batch.length

      // Update progress
      await supabase
        .from('import_jobs')
        .update({ 
          processed_records: processedCount,
          total_records: validatedData.length
        })
        .eq('id', jobId)
    }

    // Mark job as completed
    await supabase
      .from('import_jobs')
      .update({ 
        status: 'completed',
        processed_records: processedCount,
        total_records: validatedData.length
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ success: true, processed_count: processedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Import job failed:', error)
    
    // Mark job as failed
    await supabase
      .from('import_jobs')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error)
      })
      .eq('id', jobId)

    throw error
  }
}

async function downloadAndParseFile(fileUrl: string, fileType: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const content = await response.text()

  switch (fileType.toLowerCase()) {
    case 'csv':
      return parseCSV(content)
    case 'json':
      return JSON.parse(content) as Record<string, unknown>[]
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row')
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const records: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const record: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      record[header] = values[index] || ''
    })
    
    records.push(record)
  }

  return records
}

// Define types for model and data
interface ModelField {
  name: string
  type: string
}

interface DataModel {
  fields: ModelField[]
}

type RecordData = Record<string, unknown>

function validateDataAgainstModel(data: RecordData[], model: DataModel): RecordData[] {
  const validatedData: RecordData[] = []

  for (const record of data) {
    const validatedRecord: RecordData = {}
    let isValid = true

    for (const field of model.fields) {
      const value = record[field.name]
      
      if (value === undefined || value === null || value === '') {
        // Skip empty values for now
        continue
      }

      // Basic type validation
      switch (field.type) {
        case 'number': {
          const numValue = Number(value)
          if (isNaN(numValue)) {
            console.warn(`Invalid number value for field ${field.name}: ${value}`)
            isValid = false
            break
          }
          validatedRecord[field.name] = numValue
          break
        }
        case 'email': {
          if (!isValidEmail(value as string)) {
            console.warn(`Invalid email value for field ${field.name}: ${value}`)
            isValid = false
            break
          }
          validatedRecord[field.name] = value
          break
        }
        case 'phone': {
          if (!isValidPhone(value as string)) {
            console.warn(`Invalid phone value for field ${field.name}: ${value}`)
            isValid = false
            break
          }
          validatedRecord[field.name] = value
          break
        }
        case 'date': {
          const dateValue = new Date(value as string)
          if (isNaN(dateValue.getTime())) {
            console.warn(`Invalid date value for field ${field.name}: ${value}`)
            isValid = false
            break
          }
          validatedRecord[field.name] = dateValue.toISOString()
          break
        }
        default: {
          validatedRecord[field.name] = String(value)
        }
      }
    }

    if (isValid && Object.keys(validatedRecord).length > 0) {
      validatedData.push(validatedRecord)
    }
  }

  return validatedData
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - adjust as needed
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/
  return phoneRegex.test(phone)
}