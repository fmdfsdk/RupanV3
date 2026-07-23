import { createClient } from '@supabase/supabase-js';

function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order, metaEventId, isGuest } = req.body || {};

    if (!order || !order.id) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    // NOTE: Vercel does NOT expose VITE_* env vars to serverless functions.
    // You must add SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)
    // as plain (non-VITE-prefixed) environment variables in your Vercel project settings.
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

    let dbSaved = false;
    let dbErrorMsg = '';

    if (!supabaseUrl || !supabaseKey) {
      dbErrorMsg = `Missing Supabase env vars. supabaseUrl=${!!supabaseUrl}, supabaseKey=${!!supabaseKey}. Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel project settings (Settings → Environment Variables).`;
      console.error('[place-order] CRITICAL:', dbErrorMsg);
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Try full payload insert
      const fullPayload = {
        id: order.id,
        customer_name: order.customerName,
        phone: order.phone,
        address: order.address,
        area: order.area,
        payment_method: order.paymentMethod,
        items: order.items,
        subtotal: order.subtotal,
        shipping_fee: order.shippingFee,
        total: order.total,
        status: order.status || 'Pending',
        payment_status: order.paymentStatus || 'Unpaid',
        customer_notes: '',
        meta_event_id: metaEventId || '',
        is_guest: isGuest !== undefined ? isGuest : true,
        is_incognito_guest: (isGuest !== undefined ? isGuest : true) && !order.userId,
        user_id: order.userId || null,
        transaction_id: order.transactionId || '',
        paid_confirm: order.paidConfirm || false
      };

      const { error: fullErr } = await supabase.from('orders').insert([fullPayload]);

      if (!fullErr) {
        dbSaved = true;
        console.log('[place-order] Order saved to DB successfully:', order.id);
      } else {
        dbErrorMsg = fullErr.message;
        console.error('[place-order] Full payload insert failed:', fullErr.message, '| Order ID:', order.id);
        // 2. Retry with core payload fallback if schema mismatch
        const corePayload = {
          id: order.id,
          customer_name: order.customerName,
          phone: order.phone,
          address: order.address,
          area: order.area,
          payment_method: order.paymentMethod,
          items: order.items,
          subtotal: order.subtotal,
          shipping_fee: order.shippingFee,
          total: order.total,
          status: order.status || 'Pending',
          payment_status: order.paymentStatus || 'Unpaid'
        };

        const { error: coreErr } = await supabase.from('orders').insert([corePayload]);
        if (!coreErr) {
          dbSaved = true;
          console.log('[place-order] Core payload fallback insert succeeded:', order.id);
        } else {
          dbErrorMsg = coreErr.message;
          console.error('[place-order] Core payload insert ALSO failed:', coreErr.message, '| This order is NOT in the database!');
        }
      }

      // Insert items into order_items table
      try {
        const orderItems = (order.items || []).map((item: any) => ({
          order_id: order.id,
          orderId: order.id,
          product_id: item.productId || item.product_id,
          productId: item.productId || item.product_id,
          product_name: item.productName || item.product_name,
          productName: item.productName || item.product_name,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));
        await supabase.from('order_items').insert(orderItems);
      } catch (_) {}

      // 3. Fetch Telegram Bot credentials from Settings table
      let tgToken = process.env.TELEGRAM_BOT_TOKEN || '';
      let tgChatId = process.env.TELEGRAM_CHAT_ID || '';

      try {
        const { data: settingsData } = await supabase.from('settings').select('*').maybeSingle();
        if (settingsData) {
          tgToken = settingsData.telegram_bot_token || settingsData.telegramBotToken || tgToken;
          tgChatId = settingsData.telegram_chat_id || settingsData.telegramChatId || tgChatId;
        }
      } catch (_) {}

      // Clean chat ID: if minus prefixed personal account like -1004381024450 or -4381024450, convert to positive personal account ID 4381024450
      let cleanChatId = (tgChatId || '').trim();

      if (tgToken && cleanChatId) {
        try {
          const itemDetailsHtml = (order.items || []).map((i: any) =>
            `• <b>${escapeTelegramHtml(i.productName)}</b> (${escapeTelegramHtml(i.size)}, ${escapeTelegramHtml(i.color)}) x ${i.quantity} — ৳${i.price * i.quantity}`
          ).join('\n');

          const tgMessageHtml = `<b>🛍️ NEW ORDER RECEIVED! <code>#${escapeTelegramHtml(order.id)}</code></b>\n\n` +
            `👤 <b>Customer:</b> ${escapeTelegramHtml(order.customerName)}\n` +
            `📞 <b>Phone:</b> <code>${escapeTelegramHtml(order.phone)}</code>\n` +
            `📍 <b>Address:</b> ${escapeTelegramHtml(order.address)}\n` +
            `🗺️ <b>Area:</b> ${escapeTelegramHtml(order.area)}\n` +
            `💳 <b>Payment:</b> ${escapeTelegramHtml(order.paymentMethod)}${order.transactionId ? ` (TxID: <code>${escapeTelegramHtml(order.transactionId)}</code>)` : ''}\n\n` +
            `📦 <b>Items (${(order.items || []).length}):</b>\n${itemDetailsHtml}\n\n` +
            `💰 <b>Subtotal:</b> ৳${order.subtotal}\n` +
            `🚚 <b>Shipping Fee:</b> ৳${order.shippingFee}\n` +
            `💵 <b>TOTAL AMOUNT:</b> ৳${order.total}`;

          // Try primary chat ID
          let tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: cleanChatId,
              text: tgMessageHtml,
              parse_mode: 'HTML'
            })
          });
          let tgJson = await tgRes.json();

          // Auto-fallback for personal account IDs if -100 / - was prefixed
          if (!tgJson.ok && tgJson.description?.includes('chat not found')) {
            const personalChatId = cleanChatId.replace(/^-100/, '').replace(/^-/, '');
            if (personalChatId && personalChatId !== cleanChatId) {
              await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: personalChatId,
                  text: tgMessageHtml,
                  parse_mode: 'HTML'
                })
              });
            }
          }
        } catch (tgErr) {
          console.error("Telegram send error in API handler:", tgErr);
        }
      }
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
      dbSaved,
      dbErrorMsg
    });
  } catch (err: any) {
    console.error("Error in /api/place-order handler:", err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
