import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const { data: logs, error: logsError } = await supabase
      .from('sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    const { data: sources, error: sourcesError } = await supabase
      .from('sync_sources')
      .select('*');

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      logs: logs || [],
      logsError: logsError?.message || null,
      sourcesCount: sources?.length || 0,
      sourcesError: sourcesError?.message || null
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
