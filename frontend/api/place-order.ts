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

      // =========================================================================
      // BACKEND ENFORCEMENT: Minimum Price Floor & Multi-Discount Protection
      // Formula: Final Payable Subtotal = max(Floor Subtotal, Discounted Selling Subtotal)
      // =========================================================================
      let validatedSubtotal = Number(order.subtotal || 0);
      let validatedTotal = Number(order.total || 0);
      const validatedShipping = Number(order.shippingFee || 0);
      let calculatedFloorSubtotal = 0;
      let calculatedSellingSubtotal = 0;

      try {
        const itemIds = (order.items || [])
          .map((i: any) => i.productId || i.product_id)
          .filter(Boolean);

        if (itemIds.length > 0) {
          const { data: dbProducts } = await supabase
            .from('products')
            .select('id, price, discount_price, purchase_price, final_price')
            .in('id', itemIds);

          const dbProdMap = new Map((dbProducts || []).map((p: any) => [p.id, p]));

          for (const item of (order.items || [])) {
            const pId = item.productId || item.product_id;
            const qty = Math.max(1, Number(item.quantity || 1));
            const dbP = dbProdMap.get(pId);

            if (dbP) {
              const sellPrice = Number(dbP.discount_price || dbP.price || item.price || 0);
              const floorPrice = Number(
                dbP.final_price !== undefined && dbP.final_price !== null
                  ? dbP.final_price
                  : Math.round(Number(dbP.price || sellPrice) - 0.25 * Math.max(0, Number(dbP.price || sellPrice) - Number(dbP.purchase_price || sellPrice)))
              );

              calculatedSellingSubtotal += sellPrice * qty;
              calculatedFloorSubtotal += floorPrice * qty;
            } else {
              const fallbackPrice = Number(item.price || 0);
              calculatedSellingSubtotal += fallbackPrice * qty;
              calculatedFloorSubtotal += fallbackPrice * qty;
            }
          }

          // Discount margin pool allowed between selling price and floor price
          const maxDiscountAllowed = Math.max(0, calculatedSellingSubtotal - calculatedFloorSubtotal);
          const requestedOnlineDiscount = Math.max(0, Number(order.onlinePaymentDiscount || 0));
          const requestedCouponDiscount = Math.max(0, Number(order.couponDiscount || 0));
          const totalRequestedDiscount = requestedOnlineDiscount + requestedCouponDiscount;

          // Enforce: Final Payable Amount = max(Final Price, Discounted Selling Price)
          const enforcedDiscount = Math.min(totalRequestedDiscount, maxDiscountAllowed);
          const enforcedSubtotal = calculatedSellingSubtotal - enforcedDiscount;
          const enforcedMinimumTotal = enforcedSubtotal + validatedShipping;

          // If client submitted total is below the protected floor (allowing 1 Tk rounding tolerance),
          // clamp to the protected minimum
          if (validatedTotal < enforcedMinimumTotal - 1) {
            console.warn(`[place-order] Price below floor detected for order ${order.id}. Clamping: ${enforcedMinimumTotal} (was ${validatedTotal})`);
            validatedTotal = enforcedMinimumTotal;
            validatedSubtotal = enforcedSubtotal;
            order.total = validatedTotal;
            order.subtotal = validatedSubtotal;
            order.onlinePaymentDiscount = Math.min(requestedOnlineDiscount, enforcedDiscount);
          }
        }
      } catch (priceCheckErr) {
        console.warn('[place-order] Price floor verification warning:', priceCheckErr);
      }

      // 1. Try full payload insert
      const fullPayload = {
        id: order.id,
        customer_name: order.customerName,
        phone: order.phone,
        address: order.address,
        area: order.area,
        payment_method: order.paymentMethod,
        items: order.items,
        subtotal: validatedSubtotal,
        shipping_fee: order.shippingFee,
        total: validatedTotal,
        status: order.status || 'Pending',
        payment_status: order.paymentStatus || 'Unpaid',
        customer_notes: '',
        meta_event_id: metaEventId || '',
        is_guest: isGuest !== undefined ? isGuest : true,
        is_incognito_guest: (isGuest !== undefined ? isGuest : true) && !order.userId,
        user_id: order.userId || null,
        transaction_id: order.transactionId || '',
        paid_confirm: order.paidConfirm || false,
        division: order.division || null,
        district: order.district || null,
        online_payment_discount: order.onlinePaymentDiscount || 0,
        payment_screenshot_url: (order.paymentScreenshotUrl && order.paymentScreenshotUrl.startsWith('data:'))
          ? null
          : (order.paymentScreenshotUrl || null)
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
          product_id: item.productId || item.product_id,
          product_name: item.productName || item.product_name,
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

      // Clean chat ID: remove any -100 prefix for personal accounts
      let cleanChatId = (tgChatId || '').trim();

      if (tgToken && cleanChatId) {
        try {
          const itemDetailsHtml = (order.items || []).map((i: any) =>
            `• <b>${escapeTelegramHtml(i.productName)}</b> (${escapeTelegramHtml(i.size)}, ${escapeTelegramHtml(i.color)}) x ${i.quantity} — ৳${i.price * i.quantity}`
          ).join('\n');

          const paymentLine = order.paymentMethod === 'Bangla QR'
            ? `💳 <b>Payment:</b> Bangla QR${order.paidConfirm ? ' ✅ Confirmed' : ''}`
            : `💳 <b>Payment:</b> ${escapeTelegramHtml(order.paymentMethod)}${order.transactionId ? ` (TxID: <code>${escapeTelegramHtml(order.transactionId)}</code>)` : ''}`;

          const screenshotLine = (() => {
            if (!order.paymentScreenshotUrl) return '';
            if (order.paymentScreenshotUrl.startsWith('http://') || order.paymentScreenshotUrl.startsWith('https://')) {
              return `\n🖼️ <b>Screenshot:</b> <a href="${order.paymentScreenshotUrl}">View</a>`;
            }
            if (order.paymentScreenshotUrl.startsWith('data:image/')) {
              return `\n🖼️ <b>Screenshot:</b> (Local image — sent separately)`;
            }
            return '';
          })();

          const discountLine = (order.onlinePaymentDiscount && order.onlinePaymentDiscount > 0)
            ? `\n🎁 <b>Online Payment Discount:</b> -৳${order.onlinePaymentDiscount}`
            : '';

          const tgMessageHtml = `<b>🛍️ NEW ORDER! <code>#${escapeTelegramHtml(order.id)}</code></b>\n\n` +
            `👤 <b>Customer:</b> ${escapeTelegramHtml(order.customerName)}\n` +
            `📞 <b>Phone:</b> <code>${escapeTelegramHtml(order.phone)}</code>\n` +
            `📍 <b>Address:</b> ${escapeTelegramHtml(order.address)}\n` +
            `🗺️ <b>Area:</b> ${order.district ? `${escapeTelegramHtml(order.district)}, ` : ''}${order.division ? `${escapeTelegramHtml(order.division)} — ` : ''}${escapeTelegramHtml(order.area)}\n` +
            `${paymentLine}${screenshotLine}\n\n` +
            `📦 <b>Items (${(order.items || []).length}):</b>\n${itemDetailsHtml}\n\n` +
            `💰 <b>Subtotal:</b> ৳${order.subtotal}\n` +
            `🚚 <b>Shipping:</b> ৳${order.shippingFee}` +
            `${discountLine}\n` +
            `💵 <b>TOTAL:</b> ৳${order.total}`;

          // Telegram message character limit protection (max 4096 chars)
          const finalTgMessage = tgMessageHtml.length > 4000
            ? tgMessageHtml.substring(0, 3950) + '\n\n⚠️ <i>(Message truncated due to length)</i>'
            : tgMessageHtml;

          // Try primary chat ID
          let tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: cleanChatId,
              text: finalTgMessage,
              parse_mode: 'HTML',
              disable_web_page_preview: true
            })
          });
          let tgJson = await tgRes.json();

          // Auto-fallback for personal account IDs if -100 / - was prefixed
          if (!tgJson.ok && tgJson.description?.includes('chat not found')) {
            const personalChatId = cleanChatId.replace(/^-100/, '').replace(/^-/, '');
            if (personalChatId && personalChatId !== cleanChatId) {
              const fbRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: personalChatId,
                  text: finalTgMessage,
                  parse_mode: 'HTML',
                  disable_web_page_preview: true
                })
              });
              tgJson = await fbRes.json();
              if (tgJson.ok) {
                cleanChatId = personalChatId;
              }
            }
          }

          if (tgJson.ok) {
            console.log('[place-order] Telegram notification sent:', order.id);

            // Send screenshot photo to Telegram if available
            if (order.paymentScreenshotUrl) {
              try {
                if (order.paymentScreenshotUrl.startsWith('http://') || order.paymentScreenshotUrl.startsWith('https://')) {
                  // Direct URL sendPhoto (High reliability, instant delivery)
                  await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: cleanChatId,
                      photo: order.paymentScreenshotUrl,
                      caption: `🧾 Payment Receipt Proof for Order #${order.id} (${order.customerName})`,
                      parse_mode: 'HTML'
                    })
                  });
                  console.log('[place-order] Telegram payment photo sent via public URL:', order.id);
                } else if (order.paymentScreenshotUrl.startsWith('data:image/')) {
                  // Base64 multipart sendPhoto
                  const matches = order.paymentScreenshotUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                  if (matches && matches.length === 3) {
                    const mimeType = matches[1];
                    const base64Data = matches[2];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const blob = new Blob([buffer], { type: mimeType });
                    const formData = new FormData();
                    formData.append('chat_id', cleanChatId);
                    formData.append('photo', blob, `receipt_${order.id}.jpg`);
                    formData.append('caption', `🧾 Payment Receipt Proof for Order #${order.id} (${order.customerName})`);

                    await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
                      method: 'POST',
                      body: formData
                    });
                    console.log('[place-order] Telegram payment photo sent via multipart:', order.id);
                  }
                }
              } catch (photoErr) {
                console.warn('[place-order] Telegram sendPhoto error:', photoErr);
              }
            }
          } else {
            console.warn('[place-order] Telegram send failed:', tgJson.description);
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
