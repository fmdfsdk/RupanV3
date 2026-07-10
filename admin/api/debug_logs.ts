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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // 1. Get columns of 'categories' table
    const { data: cols, error: colsError } = await supabase
      .rpc('get_table_columns_debug', { tbl_name: 'categories' });

    // Fallback: query via direct SQL if we don't have RPC
    let categoriesColumns: any[] = [];
    if (colsError) {
      // Let's try to query information_schema via a select, wait, postgrest doesn't expose information_schema by default unless it's in public schema, but we can try!
      // Since postgrest doesn't allow raw SQL queries, let's try inserting a dummy row into categories and catch the error!
      const { data: testCat, error: testError } = await supabase
        .from('categories')
        .insert([{ name: 'Test Temp Category', slug: 'test-temp-category' }]);
      categoriesColumns = [{ testError: testError?.message || 'Success' }];
    } else {
      categoriesColumns = cols;
    }

    const { data: lastLogs } = await supabase
      .from('sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*')
      .limit(100);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      categoriesColumns,
      existingCategories: existingCategories || [],
      logs: lastLogs || []
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
