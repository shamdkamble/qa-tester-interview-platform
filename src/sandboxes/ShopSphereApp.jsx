import React, { useState } from 'react';
import { ShoppingBag, Trash2, Tag, ShieldCheck, CreditCard, Plus, Minus, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ShopSphereApp({ activeBugs, addLog }) {
  const [products] = useState([
    { id: 1, name: 'Pro Wireless Headphones', category: 'Audio', price: 120, rating: 4.8, image: '🎧' },
    { id: 2, name: 'Ergonomic Mechanical Keyboard', category: 'Accessories', price: 150, rating: 4.9, image: '⌨️' },
    { id: 3, name: 'UltraHD 4K Curved Monitor', category: 'Displays', price: 400, rating: 4.7, image: '🖥️' },
    { id: 4, name: 'Smart Fitness Watch Series 5', category: 'Wearables', price: 180, rating: 4.6, image: '⌚' }
  ]);

  const [cart, setCart] = useState([
    { id: 1, name: 'Pro Wireless Headphones', price: 120, qty: 1, image: '🎧' },
    { id: 2, name: 'Ergonomic Mechanical Keyboard', price: 150, qty: 1, image: '⌨️' }
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'checkout' | 'success'
  
  // Checkout Form State
  const [checkoutData, setCheckoutData] = useState({
    fullName: 'Jane Tester',
    email: 'jane.candidate@example.com',
    address: '123 Tech Park Ave',
    cardNumber: '4111222233334444',
    expiry: '12/28',
    cvv: '999'
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [staleSubtotal, setStaleSubtotal] = useState(null);

  // Add to cart
  const addToCart = (product) => {
    addLog('network', 'ShopSphere API', `POST /api/v1/cart/add - Item #${product.id} (${product.name})`);
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Update item quantity
  const updateQty = (id, newQtyVal) => {
    // Check Bug: shop_negative_qty
    const bugNegativeQty = activeBugs.includes('shop_negative_qty');

    let parsedVal = newQtyVal;
    if (!bugNegativeQty) {
      // Normal fixed logic
      if (isNaN(newQtyVal) || newQtyVal < 1) parsedVal = 1;
      else parsedVal = Math.floor(newQtyVal);
    } else {
      // Bug enabled: allow raw string parse, allow negatives and decimals
      if (typeof newQtyVal === 'string' && newQtyVal.trim() === '') parsedVal = 0;
      else parsedVal = Number(newQtyVal);
      
      if (parsedVal < 0) {
        addLog('warn', 'ShopSphere Cart', `Negative item quantity accepted: ${parsedVal}`);
      }
    }

    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: parsedVal } : item));
  };

  // Remove item
  const removeItem = (id) => {
    const bugSubtotalRefresh = activeBugs.includes('shop_subtotal_refresh');
    
    // Calculate current subtotal before removing
    const currentSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const remaining = cart.filter(item => item.id !== id);
    setCart(remaining);

    if (remaining.length === 0 && bugSubtotalRefresh) {
      // BUG: stale subtotal remains on screen when last item deleted
      setStaleSubtotal(currentSubtotal);
      addLog('warn', 'ShopSphere State Glitch', 'Last item removed, but subtotal state failed to reset.');
    } else if (remaining.length > 0) {
      setStaleSubtotal(null);
    }
  };

  // Calculate raw subtotal
  const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 0)), 0);
  const displayedSubtotal = (cart.length === 0 && staleSubtotal !== null) ? staleSubtotal : rawSubtotal;

  // Apply Coupon Logic
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SAVE20') {
      const bugDiscountFlat = activeBugs.includes('shop_discount_flat');
      
      if (bugDiscountFlat) {
        // BUG: subtracts $20 flat instead of 20% off
        setDiscountAmount(20);
        setCouponMessage({ type: 'success', text: 'Coupon SAVE20 applied! ($20 off)' });
        addLog('warn', 'ShopSphere Logic', 'Applied SAVE20: Subtracted flat $20 instead of 20% percentage calculation.');
      } else {
        // Correct 20% calculation
        const calculatedDiscount = displayedSubtotal * 0.20;
        setDiscountAmount(calculatedDiscount);
        setCouponMessage({ type: 'success', text: `Coupon SAVE20 applied! (20% off = -$${calculatedDiscount.toFixed(2)})` });
        addLog('network', 'ShopSphere Promo', `Applied SAVE20 percentage discount: -$${calculatedDiscount}`);
      }
    } else {
      setDiscountAmount(0);
      setCouponMessage({ type: 'error', text: 'Invalid promo code! Try "SAVE20"' });
      addLog('error', 'ShopSphere Promo', `Invalid coupon code attempted: ${couponCode}`);
    }
  };

  // Checkout submit
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setCheckoutError('');

    const bugCardValidation = activeBugs.includes('shop_card_validation');
    const cardNum = checkoutData.cardNumber.trim();

    if (!bugCardValidation) {
      // Correct validation
      if (!/^\d{16}$/.test(cardNum.replace(/\s+/g, ''))) {
        setCheckoutError('Invalid Credit Card number! Must be 16 numeric digits.');
        addLog('error', 'ShopSphere Checkout Validation', 'Credit Card validation rejected: Must contain 16 numeric digits.');
        return;
      }
    } else {
      // Bug enabled: accepts non-numeric or short 4 digit text
      if (isNaN(cardNum) || cardNum.length < 16) {
        addLog('warn', 'ShopSphere Validation Flaw', `Accepted invalid card number: "${cardNum}"`);
      }
    }

    addLog('network', 'ShopSphere API', 'POST /api/v1/checkout/process - Order placed successfully!');
    setActiveTab('success');
  };

  const finalTotal = Math.max(0, displayedSubtotal - discountAmount);
  const bugOverflow = activeBugs.includes('shop_checkout_overflow');

  return (
    <div className="space-y-6">
      {/* App Nav Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              ShopSphere Store
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Mock E-Commerce Sandbox
              </span>
            </h2>
            <p className="text-xs text-slate-400">Test checkout rules, promo code math, input bounds, and responsive UI layout</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('shop')} 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'shop' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'}`}
          >
            Catalog & Cart ({cart.length})
          </button>
          <button 
            onClick={() => setActiveTab('checkout')} 
            disabled={cart.length === 0}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'checkout' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40'}`}
          >
            Checkout ($${finalTotal.toFixed(2)})
          </button>
        </div>
      </div>

      {/* Main Sandbox Content */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Featured Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="glass-panel p-4 rounded-xl space-y-3 hover:border-indigo-500/40 transition">
                  <div className="text-4xl bg-slate-900/60 p-4 rounded-lg text-center">{p.image}</div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase">{p.category}</span>
                      <span className="text-xs text-amber-400">★ {p.rating}</span>
                    </div>
                    <h4 className="font-bold text-slate-200 mt-1">{p.name}</h4>
                    <p className="text-lg font-mono font-extrabold text-white mt-1">${p.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="w-full py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Shopping Cart ({cart.length})</span>
              <span className="text-xs text-indigo-400 font-mono">Promo: SAVE20</span>
            </h3>

            <div className="glass-panel p-4 rounded-xl space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm space-y-2">
                  <p>Your shopping cart is empty.</p>
                  {staleSubtotal !== null && (
                    <p className="text-xs text-amber-400 bg-amber-950/40 p-2 rounded border border-amber-800/40">
                      ⚠️ Glitch: Subtotal still reads ${staleSubtotal.toFixed(2)} despite empty cart!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.image}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">${item.price} each</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-700 rounded bg-slate-950">
                          <input 
                            type="number"
                            value={item.qty} 
                            onChange={(e) => updateQty(item.id, e.target.value)}
                            className="w-12 text-center text-xs font-mono bg-transparent py-1 text-slate-100 focus:outline-none"
                          />
                        </div>

                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-slate-800 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Promo Code (SAVE20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 glass-input rounded-lg text-xs"
                  />
                </div>
                <button type="submit" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200">
                  Apply
                </button>
              </form>

              {couponMessage && (
                <div className={`p-2 rounded text-xs flex items-center gap-2 ${couponMessage.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'}`}>
                  {couponMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{couponMessage.text}</span>
                </div>
              )}

              {/* Cart Summary */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>${displayedSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax (8%):</span>
                  <span>${(finalTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Estimated Total:</span>
                  <span className="text-emerald-400">${(finalTotal * 1.08).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button with responsive overflow bug simulation if enabled */}
              <div className={bugOverflow ? "relative -bottom-24 z-0 opacity-40 hover:opacity-100 transition" : ""}>
                <button
                  onClick={() => setActiveTab('checkout')}
                  disabled={cart.length === 0}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition disabled:opacity-40"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                {bugOverflow && (
                  <p className="text-[10px] text-rose-400 text-center mt-1 font-mono">
                    ⚠️ UI Overflow Bug Enabled: Button pushed out of container boundary!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout View */}
      {activeTab === 'checkout' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Payment & Delivery Details
            </h3>
            <span className="text-xs text-slate-400 font-mono">Order Total: ${(finalTotal * 1.08).toFixed(2)}</span>
          </div>

          {checkoutError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{checkoutError}</span>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={checkoutData.fullName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={checkoutData.email}
                  onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Shipping Address</label>
              <input
                type="text"
                required
                value={checkoutData.address}
                onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                className="w-full p-2.5 glass-input rounded-lg"
              />
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Credit Card Payment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Card Number (16 Digits)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4111222233334444"
                    value={checkoutData.cardNumber}
                    onChange={(e) => setCheckoutData({ ...checkoutData, cardNumber: e.target.value })}
                    className="w-full p-2.5 glass-input rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expiry & CVV</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      value={checkoutData.expiry}
                      onChange={(e) => setCheckoutData({ ...checkoutData, expiry: e.target.value })}
                      className="w-1/2 p-2.5 glass-input rounded-lg font-mono text-center"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      required
                      value={checkoutData.cvv}
                      onChange={(e) => setCheckoutData({ ...checkoutData, cvv: e.target.value })}
                      className="w-1/2 p-2.5 glass-input rounded-lg font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Place Order (${(finalTotal * 1.08).toFixed(2)})
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success View */}
      {activeTab === 'success' && (
        <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white">Order Confirmed!</h3>
          <p className="text-xs text-slate-400">Order #ORD-884920 has been processed successfully. Confirmation email sent to {checkoutData.email}.</p>
          <button
            onClick={() => {
              setCart([]);
              setActiveTab('shop');
              setStaleSubtotal(null);
            }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
          >
            Start New Test Order
          </button>
        </div>
      )}
    </div>
  );
}
