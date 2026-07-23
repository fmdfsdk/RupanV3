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
      paid_confirm: order.paidConfirm || false
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
