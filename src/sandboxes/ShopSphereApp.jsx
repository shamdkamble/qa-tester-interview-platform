import React, { useState } from 'react';
import {
  ShoppingBag, Trash2, Tag, ShieldCheck, CreditCard, Plus,
  ArrowRight, AlertCircle, CheckCircle2
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('shop');

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

  const updateQty = (id, newQtyVal) => {
    const bugNegativeQty = activeBugs.includes('shop_negative_qty');
    let parsedVal = newQtyVal;

    if (!bugNegativeQty) {
      if (isNaN(newQtyVal) || newQtyVal < 1) parsedVal = 1;
      else parsedVal = Math.floor(newQtyVal);
    } else {
      if (typeof newQtyVal === 'string' && newQtyVal.trim() === '') parsedVal = 0;
      else parsedVal = Number(newQtyVal);
      if (parsedVal < 0) {
        addLog('warn', 'ShopSphere Cart', `Negative item quantity accepted: ${parsedVal}`);
      }
    }

    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: parsedVal } : item));
  };

  const removeItem = (id) => {
    const bugSubtotalRefresh = activeBugs.includes('shop_subtotal_refresh');
    const currentSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const remaining = cart.filter(item => item.id !== id);
    setCart(remaining);

    if (remaining.length === 0 && bugSubtotalRefresh) {
      setStaleSubtotal(currentSubtotal);
      addLog('warn', 'ShopSphere State Glitch', 'Last item removed, but subtotal state failed to reset.');
    } else if (remaining.length > 0) {
      setStaleSubtotal(null);
    } else {
      setStaleSubtotal(null);
    }
  };

  const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 0)), 0);
  const displayedSubtotal = (cart.length === 0 && staleSubtotal !== null) ? staleSubtotal : rawSubtotal;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SAVE20') {
      const bugDiscountFlat = activeBugs.includes('shop_discount_flat');
      if (bugDiscountFlat) {
        setDiscountAmount(20);
        setCouponMessage({ type: 'success', text: 'Coupon SAVE20 applied! ($20 off)' });
        addLog('warn', 'ShopSphere Logic', 'Applied SAVE20: Subtracted flat $20 instead of 20% percentage calculation.');
      } else {
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

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setCheckoutError('');
    const bugCardValidation = activeBugs.includes('shop_card_validation');
    const cardNum = checkoutData.cardNumber.trim();

    if (!bugCardValidation) {
      if (!/^\d{16}$/.test(cardNum.replace(/\s+/g, ''))) {
        setCheckoutError('Invalid Credit Card number! Must be 16 numeric digits.');
        addLog('error', 'ShopSphere Checkout Validation', 'Credit Card validation rejected: Must contain 16 numeric digits.');
        return;
      }
    } else {
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
    <div className="space-y-6 animate-fade-in">
      <div className="app-chrome">
        <div className="flex items-center gap-3">
          <div className="app-icon bg-gradient-to-br from-emerald-500 to-cyan-500">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary flex flex-wrap items-center gap-2">
              ShopSphere Store
              <span className="badge badge-low">E-Commerce Sandbox</span>
            </h2>
            <p className="text-xs text-secondary">Promo math · quantity bounds · card validation · responsive checkout</p>
          </div>
        </div>

        <div className="nav-track">
          <button type="button" onClick={() => setActiveTab('shop')} className={`nav-pill ${activeTab === 'shop' || activeTab === 'success' ? 'active' : ''}`}>
            Catalog & Cart ({cart.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checkout')}
            disabled={cart.length === 0}
            className={`nav-pill ${activeTab === 'checkout' ? 'active' : ''}`}
          >
            Checkout (${finalTotal.toFixed(2)})
          </button>
        </div>
      </div>

      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="section-label">Featured Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
              {products.map(p => (
                <div key={p.id} className="glass-panel p-4 rounded-2xl space-y-3 group hover:border-indigo-500/35">
                  <div className="text-4xl bg-[var(--bg-muted)] p-5 rounded-xl text-center group-hover:scale-[1.02] transition">
                    {p.image}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">{p.category}</span>
                      <span className="text-xs text-amber-400 font-medium">★ {p.rating}</span>
                    </div>
                    <h4 className="font-bold text-primary mt-1">{p.name}</h4>
                    <p className="text-lg font-mono font-extrabold text-primary mt-1">${p.price}</p>
                  </div>
                  <button type="button" onClick={() => addToCart(p)} className="btn btn-primary w-full">
                    <Plus className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="section-label flex items-center justify-between">
              <span>Shopping Cart ({cart.length})</span>
              <span className="text-[10px] text-indigo-400 font-mono normal-case tracking-normal">Promo: SAVE20</span>
            </h3>

            <div className="glass-panel p-4 rounded-2xl space-y-4 sticky top-28">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-secondary text-sm space-y-2">
                  <p>Your cart is empty.</p>
                  {staleSubtotal !== null && (
                    <p className="alert alert-warn text-left text-xs">
                      Subtotal still reads ${staleSubtotal.toFixed(2)} despite empty cart.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="surface-muted rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{item.image}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary truncate">{item.name}</p>
                          <p className="text-[11px] text-muted font-mono">${item.price} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateQty(item.id, e.target.value)}
                          className="w-14 text-center text-xs font-mono glass-input py-1.5 px-1"
                        />
                        <button type="button" onClick={() => removeItem(item.id)} className="btn-icon text-muted hover:text-rose-400" title="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-[var(--border)] flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Promo (SAVE20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="glass-input pl-8 py-2 text-xs"
                  />
                </div>
                <button type="submit" className="btn btn-ghost">Apply</button>
              </form>

              {couponMessage && (
                <div className={`alert ${couponMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                  {couponMessage.type === 'success'
                    ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{couponMessage.text}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[var(--border)] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span>${displayedSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary">
                  <span>Est. Tax (8%)</span>
                  <span>${(finalTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary pt-2 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span className="text-emerald-400">${(finalTotal * 1.08).toFixed(2)}</span>
                </div>
              </div>

              <div className={bugOverflow ? 'relative -bottom-24 z-0 opacity-40 hover:opacity-100 transition' : ''}>
                <button
                  type="button"
                  onClick={() => setActiveTab('checkout')}
                  disabled={cart.length === 0}
                  className="btn btn-success w-full py-2.5"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                {bugOverflow && (
                  <p className="text-[10px] text-rose-400 text-center mt-1 font-mono">
                    UI overflow: button pushed outside container
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checkout' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Payment & Delivery
            </h3>
            <span className="text-xs text-muted font-mono">Total: ${(finalTotal * 1.08).toFixed(2)}</span>
          </div>

          {checkoutError && (
            <div className="alert alert-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Full Name</label>
                <input type="text" required value={checkoutData.fullName} onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })} className="glass-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Email</label>
                <input type="email" required value={checkoutData.email} onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })} className="glass-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Shipping Address</label>
              <input type="text" required value={checkoutData.address} onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })} className="glass-input" />
            </div>

            <div className="surface-muted rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Credit Card
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-muted mb-1">Card Number (16 digits)</label>
                  <input type="text" required placeholder="4111222233334444" value={checkoutData.cardNumber} onChange={(e) => setCheckoutData({ ...checkoutData, cardNumber: e.target.value })} className="glass-input font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] text-muted mb-1">Expiry & CVV</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="MM/YY" required value={checkoutData.expiry} onChange={(e) => setCheckoutData({ ...checkoutData, expiry: e.target.value })} className="w-1/2 glass-input font-mono text-center" />
                    <input type="text" placeholder="CVV" required value={checkoutData.cvv} onChange={(e) => setCheckoutData({ ...checkoutData, cvv: e.target.value })} className="w-1/2 glass-input font-mono text-center" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setActiveTab('shop')} className="btn btn-ghost">Back to Cart</button>
              <button type="submit" className="btn btn-success flex-1 py-2.5">
                Place Order (${(finalTotal * 1.08).toFixed(2)})
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'success' && (
        <div className="max-w-md mx-auto glass-panel-glow p-8 rounded-2xl text-center space-y-4 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-primary">Order Confirmed</h3>
          <p className="text-xs text-secondary leading-relaxed">
            Order #ORD-884920 processed. Confirmation sent to {checkoutData.email}.
          </p>
          <button
            type="button"
            onClick={() => { setCart([]); setActiveTab('shop'); setStaleSubtotal(null); setDiscountAmount(0); setCouponMessage(null); }}
            className="btn btn-primary px-6"
          >
            Start New Order
          </button>
        </div>
      )}
    </div>
  );
}
