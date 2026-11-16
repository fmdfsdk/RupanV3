import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const orderService = {
  /**
   * Inserts a new order into the database.
   */
  async createOrder(order: Order, metaEventId: string, isGuest: boolean): Promise<void> {
    // 1. Save to local storage backup immediately so no order is EVER lost!
    try {
      const existingLocal = JSON.parse(localStorage.getItem('rupan_local_orders') || '[]');
      const updatedLocal = [order, ...existingLocal.filter((o: any) => o.id !== order.id)];
      localStorage.setItem('rupan_local_orders', JSON.stringify(updatedLocal));
      
      // Dispatch custom event so open Admin Panel tabs pick it up instantly
      window.dispatchEvent(new CustomEvent('rupan:order_created', { detail: order }));
    } catch (e) {
      console.warn("Could not save order to localStorage:", e);
    }

    // 2. Execute Vercel Serverless Backend API /api/place-order for guaranteed DB insertion & Telegram alerts
    try {
      const apiRes = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, metaEventId, isGuest })
      });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        console.log("Vercel Serverless Order Placement Result:", apiData);
        if (apiData.dbSaved) return;
      }
    } catch (apiErr) {
      console.warn("Vercel Serverless API fetch failed, proceeding with direct client fallback...", apiErr);
    }

    // 2. Full Payload insert attempt
    const fullPayload: any = {
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
      meta_event_id: metaEventId,
      is_guest: isGuest,
      is_incognito_guest: isGuest && !order.userId, // guest with no account = incognito
      user_id: order.userId || null,
      transaction_id: order.transactionId || '',
      paid_confirm: order.paidConfirm || false,
      division: order.division || '',
      district: order.district || '',
      online_payment_discount: order.onlinePaymentDiscount || 0,
      payment_screenshot_url: order.paymentScreenshotUrl || ''
    };

    let { error } = await supabase.from('orders').insert([fullPayload]);

    // If full payload failed (e.g., column missing in schema cache), retry with core payload!
    if (error) {
      console.warn("Full order insert failed, retrying with core columns fallback...", error.message);
      const corePayload: any = {
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

      const { error: fallbackErr } = await supabase.from('orders').insert([corePayload]);
      if (fallbackErr) {
        console.error("Core order insert error:", fallbackErr.message);
      }
    }

    // Insert items into public.order_items table if available
    try {
      const orderItems = order.items.map(item => ({
        order_id: order.id,
        orderId: order.id,
        product_id: item.productId,
        productId: item.productId,
        product_name: item.productName,
        productName: item.productName,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      await supabase.from('order_items').insert(orderItems);
    } catch (_) {}

    // 3. Guaranteed Telegram Alert Fallback (fires if serverless /api/place-order was unreachable or in dev mode)
    try {
      const { data: settingsData } = await supabase.from('settings').select('*').maybeSingle();
      const tgToken = settingsData?.telegram_bot_token || settingsData?.telegramBotToken;
      const tgChatId = settingsData?.telegram_chat_id || settingsData?.telegramChatId;
      const tgEnabled = settingsData?.telegram_notifications_enabled ?? true;

      if (tgToken && tgChatId && tgEnabled) {
        const escapeHtml = (text: string) => (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const itemDetailsHtml = (order.items || []).map(i => 
          `• <b>${escapeHtml(i.productName)}</b> (${escapeHtml(i.size)}, ${escapeHtml(i.color)}) x ${i.quantity} — ৳${i.price * i.quantity}`
        ).join('\n');

        const paymentLine = order.paymentMethod === 'Bangla QR'
          ? `💳 <b>Payment:</b> Bangla QR${order.paidConfirm ? ' ✅ Confirmed' : ''}`
          : `💳 <b>Payment:</b> ${escapeHtml(order.paymentMethod)}${order.transactionId ? ` (TxID: <code>${escapeHtml(order.transactionId)}</code>)` : ''}`;

        const discountLine = (order.onlinePaymentDiscount && order.onlinePaymentDiscount > 0)
          ? `\n🎁 <b>Online Payment Discount:</b> -৳${order.onlinePaymentDiscount}`
          : '';

        const tgMessageHtml = `<b>🛍️ NEW ORDER RECEIVED! <code>#${escapeHtml(order.id)}</code></b>\n\n` +
          `👤 <b>Customer:</b> ${escapeHtml(order.customerName)}\n` +
          `📞 <b>Phone:</b> <code>${escapeHtml(order.phone)}</code>\n` +
          `📍 <b>Address:</b> ${escapeHtml(order.address)}\n` +
          `🗺️ <b>Area:</b> ${order.district ? `${escapeHtml(order.district)}, ` : ''}${order.division ? `${escapeHtml(order.division)} — ` : ''}${escapeHtml(order.area)}\n` +
          `${paymentLine}${order.paymentScreenshotUrl ? `\n🖼️ <b>Screenshot:</b> <a href="${order.paymentScreenshotUrl}">View</a>` : ''}\n\n` +
          `📦 <b>Items (${(order.items || []).length}):</b>\n${itemDetailsHtml}\n\n` +
          `💰 <b>Subtotal:</b> ৳${order.subtotal}\n` +
          `🚚 <b>Shipping Fee:</b> ৳${order.shippingFee}` +
          `${discountLine}\n` +
          `💵 <b>TOTAL AMOUNT:</b> ৳${order.total}`;

        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: String(tgChatId).trim(),
            text: tgMessageHtml,
            parse_mode: 'HTML'
          })
        });
      }
    } catch (tgErr) {
      console.warn("Could not dispatch fallback telegram notification:", tgErr);
    }
  },

  /**
   * Fetches orders placed by a specific customer.
   */
  async fetchOrdersByCustomer(username: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_name', username)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch customer orders: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      customerName: d.customer_name,
      phone: d.phone,
      address: d.address,
      area: d.area,
      paymentMethod: d.payment_method,
      items: d.items,
      subtotal: d.subtotal,
      shippingFee: d.shipping_fee,
      total: d.total,
      status: d.status,
      paymentStatus: d.payment_status,
      createdAt: d.created_at,
      isGuest: d.is_guest
    }));
  },

  /**
   * Fetches orders placed by a specific authenticated user.
   */
  async fetchOrdersByUserId(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user orders: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      customerName: d.customer_name,
      phone: d.phone,
      address: d.address,
      area: d.area,
      paymentMethod: d.payment_method,
      items: d.items,
      subtotal: d.subtotal,
      shippingFee: d.shipping_fee,
      total: d.total,
      status: d.status,
      paymentStatus: d.payment_status,
      createdAt: d.created_at,
      isGuest: d.is_guest,
      userId: d.user_id
    }));
  },

  /**
   * Fetches a single order by ID and Phone (for public/guest tracking).
   */
  async fetchOrderByIdAndPhone(id: string, phone: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to track order: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      customerName: data.customer_name,
      phone: data.phone,
      address: data.address,
      area: data.area,
      paymentMethod: data.payment_method,
      items: data.items,
      subtotal: data.subtotal,
      shippingFee: data.shipping_fee,
      total: data.total,
      status: data.status,
      paymentStatus: data.payment_status,
      createdAt: data.created_at,
      isGuest: data.is_guest
    };
  }
};
