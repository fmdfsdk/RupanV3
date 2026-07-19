import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const orderService = {
  /**
   * Inserts a new order into the database.
   */
  async createOrder(order: Order, metaEventId: string, isGuest: boolean): Promise<void> {
    const { error } = await supabase.from('orders').insert([{
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
      user_id: order.userId,
      transaction_id: order.transactionId,
      paid_confirm: order.paidConfirm
    }]);

    if (error) {
      throw new Error(`Failed to place order in database: ${error.message}`);
    }

    // Insert items into public.order_items table
    const orderItems = order.items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      color: item.color,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      console.error('Failed to insert order items: ', itemsError.message);
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
