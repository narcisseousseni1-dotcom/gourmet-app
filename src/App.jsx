import React, { useState } from 'react';
import { ShoppingCart, Calendar, Utensils, Plus, Minus, Trash2, CheckCircle, Clock, Users, ChefHat } from 'lucide-react';

// ============================================
// 🔧 CONFIGURATION — Modifie ici facilement
// ============================================
const CONFIG = {
  restaurantName: "Gourmet App",
  subtitle: "Commandez & Réservez",
  // 👇 Ajoute tes URLs de webhooks n8n ici quand tu seras prêt
  webhooks: {
    order: "", // ex: "https://ton-n8n.com/webhook/commande"
    reservation: "", // ex: "https://ton-n8n.com/webhook/reservation"
  },
};

const MENU_ITEMS = [
  { id: 1, name: "Le Burger Signature", price: 14.90, category: "Plats", image: "🍔", desc: "Boeuf charolais, cheddar affiné, sauce secrète." },
  { id: 2, name: "Pizza Truffe & Champignons", price: 16.50, category: "Plats", image: "🍕", desc: "Crème de truffe, mozzarella fior di latte." },
  { id: 3, name: "Salade César Palace", price: 13.00, category: "Entrées", image: "🥗", desc: "Poulet croustillant, parmesan, croûtons maison." },
  { id: 4, name: "Soupe à l'Oignon", price: 8.50, category: "Entrées", image: "🍲", desc: "Gratinée au gruyère, croûtons dorés." },
  { id: 5, name: "Tiramisu della Nonna", price: 7.50, category: "Desserts", image: "🍰", desc: "La recette traditionnelle italienne." },
  { id: 6, name: "Fondant au Chocolat", price: 8.00, category: "Desserts", image: "🍫", desc: "Coeur coulant, glace vanille." },
  { id: 7, name: "Cocktail Maison", price: 9.00, category: "Boissons", image: "🍹", desc: "Gin, basilic, citron vert et concombre." },
  { id: 8, name: "Limonade Artisanale", price: 5.50, category: "Boissons", image: "🍋", desc: "Citron pressé, menthe fraîche, miel." },
];

const CATEGORIES = ['Tous', 'Entrées', 'Plats', 'Desserts', 'Boissons'];

// ============================================
// 📡 Fonctions webhook (pour n8n)
// ============================================
async function sendToWebhook(url, data) {
  if (!url) {
    console.log("⚠️ Webhook non configuré. Données:", data);
    return { ok: true, simulated: true };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("Erreur webhook:", err);
    return { ok: false, error: err.message };
  }
}

// ============================================
// 🎨 APP
// ============================================
export default function App() {
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [showResSuccess, setShowResSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [isLoading, setIsLoading] = useState(false);

  const filteredItems = selectedCategory === 'Tous'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(i => i.category === selectedCategory);

  // Panier
  const addToCart = (item) => {
    const existing = cart.find(x => x.id === item.id);
    if (existing) {
      setCart(cart.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const existing = cart.find(x => x.id === item.id);
    if (existing.qty === 1) {
      setCart(cart.filter(x => x.id !== item.id));
    } else {
      setCart(cart.map(x => x.id === item.id ? { ...x, qty: x.qty - 1 } : x));
    }
  };

  const deleteFromCart = (id) => setCart(cart.filter(x => x.id !== id));
  const getItemQty = (id) => cart.find(x => x.id === id)?.qty || 0;

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  // Commande → webhook n8n
  const handleOrder = async () => {
    if (cart.length === 0) return;
    setIsLoading(true);

    const orderData = {
      timestamp: new Date().toISOString(),
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price, subtotal: i.price * i.qty })),
      total: total,
      itemCount: cartCount,
    };

    await sendToWebhook(CONFIG.webhooks.order, orderData);

    setIsLoading(false);
    setShowOrderSuccess(true);
    setCart([]);
    setTimeout(() => setShowOrderSuccess(false), 3000);
  };

  // Réservation → webhook n8n
  const [resForm, setResForm] = useState({ guests: '2', date: '', time: '19:00', name: '', phone: '', notes: '' });

  const handleReservation = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const reservationData = {
      timestamp: new Date().toISOString(),
      guests: parseInt(resForm.guests),
      date: resForm.date,
      time: resForm.time,
      name: resForm.name,
      phone: resForm.phone,
      notes: resForm.notes,
    };

    await sendToWebhook(CONFIG.webhooks.reservation, reservationData);

    setIsLoading(false);
    setShowResSuccess(true);
    setResForm({ guests: '2', date: '', time: '19:00', name: '', phone: '', notes: '' });
    setTimeout(() => setShowResSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 max-w-md mx-auto overflow-hidden relative">

      {/* HEADER */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-4 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
              <ChefHat size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">{CONFIG.restaurantName}</h1>
              <p className="text-orange-100 text-xs">{CONFIG.subtitle}</p>
            </div>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => setActiveTab('cart')}
              className="bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-opacity-30 transition-all"
            >
              <ShoppingCart size={14} />
              {cartCount}
            </button>
          )}
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 overflow-y-auto hide-scrollbar" style={{ paddingBottom: '5.5rem' }}>

        {/* === MENU === */}
        {activeTab === 'menu' && (
          <div className="p-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredItems.map(item => {
              const qty = getItemQty(item.id);
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md animate-slide-up">
                  <div className="text-4xl bg-orange-50 w-16 h-16 flex items-center justify-center rounded-xl flex-shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.name}</h3>
                      <span className="text-xs text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">{item.category}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-orange-600">{item.price.toFixed(2)} €</span>
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-orange-600 text-white p-2 rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
                        >
                          <Plus size={16} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
                          <button onClick={() => removeFromCart(item)} className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-5 text-center text-orange-700">{qty}</span>
                          <button onClick={() => addToCart(item)} className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* === PANIER === */}
        {activeTab === 'cart' && (
          <div className="p-4 flex flex-col min-h-full">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Votre Panier</h2>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-16">
                <div className="bg-gray-100 p-6 rounded-full">
                  <ShoppingCart size={48} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Votre panier est vide</p>
                <p className="text-gray-400 text-sm">Ajoutez des plats depuis le menu</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:bg-orange-700 transition-all mt-2"
                >
                  Voir le menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 animate-slide-up">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0">{item.image}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          <div className="text-xs text-gray-400">{(item.price * item.qty).toFixed(2)} €</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                          <button onClick={() => removeFromCart(item)} className="p-1.5 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                          <button onClick={() => addToCart(item)} className="p-1.5 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50">
                            <Plus size={13} />
                          </button>
                        </div>
                        <button onClick={() => deleteFromCart(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mt-auto">
                  <div className="flex justify-between mb-1 text-sm text-gray-400">
                    <span>Sous-total ({cartCount} article{cartCount > 1 ? 's' : ''})</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between mb-1 text-sm text-gray-400">
                    <span>Livraison</span>
                    <span className="text-green-500 font-medium">Gratuite</span>
                  </div>
                  <div className="border-t border-gray-100 my-3"></div>
                  <div className="flex justify-between mb-4 text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-orange-600">{total.toFixed(2)} €</span>
                  </div>
                  <button
                    onClick={handleOrder}
                    disabled={isLoading}
                    className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Envoi en cours...</span>
                    ) : (
                      <><CheckCircle size={18} /> Confirmer la commande</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* === RÉSERVATION === */}
        {activeTab === 'reservation' && (
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-1">Réserver une table</h2>
            <p className="text-sm text-gray-400 mb-4">Remplissez le formulaire ci-dessous</p>

            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                  <Users size={15} className="text-orange-500" /> Nombre de personnes
                </label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[1,2,3,4,5,6,8,10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setResForm({...resForm, guests: String(n)})}
                      className={`w-11 h-11 rounded-xl font-semibold text-sm transition-all ${
                        resForm.guests === String(n)
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 hover:bg-orange-50 border border-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                    <Calendar size={15} className="text-orange-500" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={resForm.date}
                    onChange={(e) => setResForm({...resForm, date: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                    <Clock size={15} className="text-orange-500" /> Heure
                  </label>
                  <select
                    value={resForm.time}
                    onChange={(e) => setResForm({...resForm, time: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-1"
                  >
                    {['12:00','12:30','13:00','13:30','19:00','19:30','20:00','20:30','21:00','21:30'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5">Nom complet</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  required
                  value={resForm.name}
                  onChange={(e) => setResForm({...resForm, name: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  required
                  value={resForm.phone}
                  onChange={(e) => setResForm({...resForm, phone: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5">Notes (optionnel)</label>
                <textarea
                  placeholder="Allergies, occasion spéciale..."
                  rows={2}
                  value={resForm.notes}
                  onChange={(e) => setResForm({...resForm, notes: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-1 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleReservation}
                disabled={isLoading || !resForm.date || !resForm.name || !resForm.phone}
                className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-md hover:bg-orange-700 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-pulse">Envoi en cours...</span>
                ) : (
                  <><Calendar size={18} /> Confirmer la réservation</>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* NAVIGATION */}
      <nav className="bg-white border-t border-gray-100 flex justify-around items-center px-2 py-2 pb-4 absolute bottom-0 left-0 right-0 z-20" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
        {[
          { id: 'menu', icon: Utensils, label: 'Menu' },
          { id: 'cart', icon: ShoppingCart, label: 'Panier', badge: cartCount },
          { id: 'reservation', icon: Calendar, label: 'Réserver' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-2xl w-20 transition-all ${
              activeTab === tab.id ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <div className="relative">
              <tab.icon size={22} />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium mt-1">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* POPUP SUCCÈS */}
      {(showOrderSuccess || showResSuccess) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fade-in" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs mx-4 animate-fade-in">
            <div className="bg-green-50 p-4 rounded-full mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {showOrderSuccess ? "Commande envoyée !" : "Table réservée !"}
            </h3>
            <p className="text-gray-500 text-sm">
              {showOrderSuccess
                ? "Votre commande a été transmise. Bon appétit ! 🎉"
                : "Votre réservation est confirmée. À bientôt ! 🎉"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
