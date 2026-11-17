import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { action, id, product } = req.body || {};

    if (!action || !['update', 'insert', 'delete'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action parameter' });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      '';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      '';

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase credentials on server'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    if (action === 'update') {
      if (!id || !product) {
        return res.status(400).json({ success: false, error: 'Missing id or product payload' });
      }
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select();

      if (error) {
        return res.status(400).json({ success: false, error: error.message, code: error.code });
      }
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Product with ID "${id}" was not found or could not be updated.`,
          code: 'ZERO_ROWS_UPDATED'
        });
      }
      return res.status(200).json({ success: true, data: data[0] });
    }

    if (action === 'insert') {
      if (!product) {
        return res.status(400).json({ success: false, error: 'Missing product payload' });
      }
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

      if (error) {
        return res.status(400).json({ success: false, error: error.message, code: error.code });
      }
      if (!data || data.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Insert returned 0 rows.',
          code: 'ZERO_ROWS_INSERTED'
        });
      }
      return res.status(200).json({ success: true, data: data[0] });
    }

    if (action === 'delete') {
      if (!id) {
        return res.status(400).json({ success: false, error: 'Missing product ID' });
      }
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        return res.status(400).json({ success: false, error: error.message, code: error.code });
      }
      return res.status(200).json({ success: true, data: data || [] });
    }

    return res.status(400).json({ success: false, error: 'Unhandled action' });
  } catch (err: any) {
    console.error('save-product handler error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal Server Error'
    });
  }
}
