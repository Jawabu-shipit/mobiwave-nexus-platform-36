import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Import processImportJob from index.ts
import { processImportJob } from './index.ts';

async function pollAndProcessJobs() {
  const { data: jobs, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  if (jobs && jobs.length > 0) {
    const job = jobs[0];
    try {
      await supabase.from('import_jobs').update({ status: 'processing' }).eq('id', job.id);
      await processImportJob(job.id);
    } catch (err) {
      console.error('Job processing failed:', err);
      await supabase.from('import_jobs').update({ status: 'failed', error_message: String(err) }).eq('id', job.id);
    }
  }
}

// Run every minute
setInterval(pollAndProcessJobs, 60 * 1000);

// Run once on start
pollAndProcessJobs();
