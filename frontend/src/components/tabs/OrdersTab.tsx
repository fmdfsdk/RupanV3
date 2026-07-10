import React from 'react';
import { ListOrdered, FileDown } from 'lucide-react';
import { Order } from '../../types';

interface OrdersTabProps {
  orders: Order[];
  selectedOrder: Order | null;
  setSelectedOrder: (o: Order | null) => void;
  orderTimeline: string[];
  setOrderTimeline: (timeline: string[]) => void;
  handleUpdateOrderStatus: (id: string, status: Order['status']) => void;
  handleUpdateOrderPayment: (id: string, paymentStatus: Order['paymentStatus']) => void;
}

export default function OrdersTab({
  orders,
  selectedOrder,
  setSelectedOrder,
  orderTimeline,
  setOrderTimeline,
  handleUpdateOrderStatus,
  handleUpdateOrderPayment
}: OrdersTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Orders Registry</h1>
          <p className="text-xs text-gray-500">Configure order fulfillment workflow states and print customer invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Orders List Index */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">All Transactions ({orders.length})</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {orders.map((o) => (
              <div 
                key={o.id} 
                onClick={() => {
                  setSelectedOrder(o);
                  setOrderTimeline([
                    `Order placed successfully at ${o.createdAt}`,
                    `Customer requested ${o.paymentMethod}`,
                    `Shipping area detected as ${o.area}`
                  ]);
                }}
                className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-blue-50/20 ${
                  selectedOrder?.id === o.id ? 'bg-blue-50/50 border-l-4 border-brand-primary' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-sm text-brand-primary font-mono">{o.id}</span>
                    <span className="text-xs font-semibold text-zinc-600">{o.customerName}</span>
                    {o.isIncognitoGuest ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-md">
                        🕶️ Incognito Guest
                      </span>
                    ) : o.isGuest ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded-md">
                        🕶️ Guest
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded-md">
                        👤 Member
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">{o.createdAt} • {o.items.length} items</p>
                </div>
                
                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <span className="text-xs font-bold text-zinc-950">৳{o.total.toLocaleString()}</span>
                    <div className="text-[10px] font-mono text-zinc-400">{o.paymentMethod}</div>
                  </div>
                  
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    o.status === 'Delivered' 
                      ? 'bg-green-50 text-green-700' 
                      : o.status === 'Cancelled'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-700 animate-pulse'
                  }`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400">Order Information</h3>
                  <span className="text-lg font-black tracking-tight text-brand-primary font-mono mt-1 block">{selectedOrder.id}</span>
                </div>
                
                {/* Print Invoice simulation */}
                <button 
                  onClick={() => {
                    const w = window.open('', '_blank');
                    if (w) {
                      w.document.write(`
                        <html>
                          <head>
                            <title>Invoice ${selectedOrder.id}</title>
                            <style>
                              body { font-family: sans-serif; padding: 40px; color: #222; }
                              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; }
                              .details { margin: 30px 0; display: flex; justify-content: space-between; }
                              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                              th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
                              th { background: #f8f9fa; }
                              .total { text-align: right; margin-top: 30px; font-size: 1.2em; font-weight: bold; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div>
                                <h1>RUPAN.</h1>
                                <p>Style That Speaks.</p>
                              </div>
                              <div>
                                <h2>INVOICE</h2>
                                <p>Order Reference: ${selectedOrder.id}</p>
                                <p>Date: ${selectedOrder.createdAt}</p>
                              </div>
                            </div>
                            <div class="details">
                              <div>
                                <h3>Billed To:</h3>
                                <p>${selectedOrder.customerName}</p>
                                <p>${selectedOrder.phone}</p>
                                <p>${selectedOrder.address}</p>
                              </div>
                              <div>
                                <h3>Payment details:</h3>
                                <p>Method: ${selectedOrder.paymentMethod}</p>
                                <p>Area: ${selectedOrder.area}</p>
                              </div>
                            </div>
                            <table>
                              <thead>
                                <tr>
                                  <th>Product name</th>
                                  <th>Color / Size</th>
                                  <th>Qty</th>
                                  <th>Unit price</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${selectedOrder.items.map(item => `
                                  <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.color} / ${item.size}</td>
                                    <td>${item.quantity}</td>
                                    <td>৳${item.price}</td>
                                    <td>৳${item.price * item.quantity}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                            <div class="total">
                              <p>Subtotal: ৳${selectedOrder.subtotal}</p>
                              <p>Shipping fee: ৳${selectedOrder.shippingFee}</p>
                              <p>Grand Total: ৳${selectedOrder.total}</p>
                            </div>
                          </body>
                        </html>
                      `);
                      w.document.close();
                      w.print();
                    }
                  }}
                  className="text-gray-400 hover:text-brand-primary p-2 rounded-lg hover:bg-gray-50 flex items-center gap-1 cursor-pointer text-xs font-bold"
                  title="Print Invoice"
                >
                  <FileDown className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>

              <div className="space-y-4">
                
                {/* Workflow selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Order Fulfillment Status</label>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-bold py-2.5 rounded-xl px-3 outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="Pending">Pending Validation</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing / Fabric Cut</option>
                    <option value="Packed">Packed & Ready</option>
                    <option value="Shipped">Shipped / Dispatched</option>
                    <option value="Delivered">Delivered (Completed)</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                {/* Payment Status selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Payment Status</label>
                  <select 
                    value={selectedOrder.paymentStatus || 'Unpaid'}
                    onChange={(e) => handleUpdateOrderPayment(selectedOrder.id, e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-bold py-2.5 rounded-xl px-3 outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="Unpaid">Unpaid / COD Balance Due</option>
                    <option value="Paid">Paid / Confirmed bKash</option>
                    <option value="Refunded">Refunded / Returned</option>
                  </select>
                </div>

                {/* Customer information */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400">Customer:</span>
                    <strong className="float-right text-zinc-900">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Order Origin:</span>
                    <strong className="float-right">
                      {selectedOrder.isIncognitoGuest ? (
                        <span className="text-orange-600">🕶️ Incognito Guest</span>
                      ) : selectedOrder.isGuest ? (
                        <span className="text-zinc-600">🕶️ Guest</span>
                      ) : (
                        <span className="text-blue-600">👤 Registered Member</span>
                      )}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <strong className="float-right text-zinc-900">{selectedOrder.phone}</strong>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-1">
                    <span className="text-gray-400">Shipping destination:</span>
                    <p className="font-semibold text-zinc-700 mt-1 leading-normal">{selectedOrder.address}</p>
                  </div>
                </div>

                {/* Customer notes */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Special Delivery Notes</span>
                  <p className="text-xs italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-amber-900">
                    {selectedOrder.customerNotes || "No custom delivery notes specified."}
                  </p>
                </div>

                {/* Order Timeline Logs */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Timeline / Audit Logs</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {orderTimeline.map((log, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] leading-relaxed text-gray-500">
                        <span className="text-brand-accent font-bold">•</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
              <ListOrdered className="w-12 h-12 stroke-1 mb-3" />
              <p className="text-xs font-semibold">Select an order from the list registry to configure fulfillment statuses, view notes, and print standard PDF receipts.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
