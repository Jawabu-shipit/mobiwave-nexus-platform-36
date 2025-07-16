import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface DataModel {
  id: string
  user_id: string
  name: string
  description?: string
  fields: DataModelField[]
  created_at: string
  updated_at: string
}

interface DataModelField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'email' | 'phone'
}

interface DataRecord {
  id: string
  model_id: string
  user_id: string
  data: Record<string, unknown>
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

    // Route handling
    if (path === '/data-hub-api/models') {
      if (method === 'GET') {
        return await getDataModels(user.id)
      } else if (method === 'POST') {
        const body = await req.json()
        return await createDataModel(user.id, body)
      }
    } else if (path.startsWith('/data-hub-api/models/')) {
      const modelId = path.split('/')[3]
      
      if (method === 'GET') {
        return await getDataModel(user.id, modelId)
      } else if (method === 'PUT') {
        const body = await req.json()
        return await updateDataModel(user.id, modelId, body)
      } else if (method === 'DELETE') {
        return await deleteDataModel(user.id, modelId)
      }
    } else if (path === '/data-hub-api/records') {
      if (method === 'GET') {
        const modelId = url.searchParams.get('model_id')
        if (!modelId) {
          throw new Error('model_id parameter is required')
        }
        return await getRecords(user.id, modelId)
      } else if (method === 'POST') {
        const body = await req.json()
        return await createRecord(user.id, body)
      }
    } else if (path.startsWith('/data-hub-api/records/')) {
      const recordId = path.split('/')[3]
      
      if (method === 'PUT') {
        const body = await req.json()
        return await updateRecord(user.id, recordId, body)
      } else if (method === 'DELETE') {
        return await deleteRecord(user.id, recordId)
      }
    } else if (path === '/data-hub-api/import') {
      if (method === 'POST') {
        const body = await req.json()
        return await importData(user.id, body)
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error: unknown) {
    let message = 'Unknown error'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getDataModels(userId: string) {
  const { data, error } = await supabase
    .from('data_models')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createDataModel(userId: string, modelData: Partial<DataModel>) {
  const { data, error } = await supabase
    .from('data_models')
    .insert([{
      user_id: userId,
      name: modelData.name,
      description: modelData.description,
      fields: modelData.fields || []
    }])
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getDataModel(userId: string, modelId: string) {
  const { data, error } = await supabase
    .from('data_models')
    .select('*')
    .eq('user_id', userId)
    .eq('id', modelId)
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateDataModel(userId: string, modelId: string, updates: Partial<DataModel>) {
  const { data, error } = await supabase
    .from('data_models')
    .update(updates)
    .eq('user_id', userId)
    .eq('id', modelId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteDataModel(userId: string, modelId: string) {
  const { error } = await supabase
    .from('data_models')
    .delete()
    .eq('user_id', userId)
    .eq('id', modelId)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getRecords(userId: string, modelId: string) {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .eq('model_id', modelId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createRecord(userId: string, recordData: Partial<DataRecord>) {
  const { data, error } = await supabase
    .from('records')
    .insert([{
      user_id: userId,
      model_id: recordData.model_id,
      data: recordData.data
    }])
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateRecord(userId: string, recordId: string, updates: Partial<DataRecord>) {
  const { data, error } = await supabase
    .from('records')
    .update({ data: updates.data })
    .eq('user_id', userId)
    .eq('id', recordId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteRecord(userId: string, recordId: string) {
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('user_id', userId)
    .eq('id', recordId)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function importData(userId: string, importData: { model_id: string, records: Record<string, unknown>[] }) {
  const { model_id, records } = importData

  // Validate that the model belongs to the user
  const { data: model, error: modelError } = await supabase
    .from('data_models')
    .select('*')
    .eq('user_id', userId)
    .eq('id', model_id)
    .single()

  if (modelError || !model) {
    throw new Error('Model not found or access denied')
  }

  // Prepare records for insertion
  const recordsToInsert = records.map(record => ({
    user_id: userId,
    model_id: model_id,
    data: record
  }))

  // Insert records in batches
  const batchSize = 100
  const results = []

  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const batch = recordsToInsert.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('records')
      .insert(batch)
      .select()

    if (error) {
      console.error('Batch insert error:', error)
      throw new Error(`Failed to insert batch starting at index ${i}: ${error.message}`)
    }

    results.push(...data)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      imported_count: results.length,
      records: results 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}