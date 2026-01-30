
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { OrderStatus, OTTService, OTTPlan, Review } from '../types';

const AdminDashboard: React.FC = () => {
  const { orders, updateOrderStatus, services, setServices, settings, setSettings, addService, deleteService, updateService } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'settings'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderProof, setSelectedOrderProof] = useState<string | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceLogo, setNewServiceLogo] = useState('');
  const [newServiceColor, setNewServiceColor] = useState('#E50914');

  const filteredOrders = orders.filter(o => 
    o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.userPhone && o.userPhone.includes(searchTerm)) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    approved: orders.filter(o => o.status === OrderStatus.APPROVED).length,
    revenue: orders.filter(o => o.status === OrderStatus.APPROVED).reduce((acc, curr) => acc + curr.amount, 0)
  };

  const handleUpdatePrice = (serviceId: string, planId: string, newPrice: number) => {
    updateService(serviceId, {
      plans: services.find(s => s.id === serviceId)?.plans.map(p => p.id === planId ? { ...p, price: newPrice } : p)
    });
  };

  const handleAddPlan = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    const newPlan: OTTPlan = {
      id: Date.now().toString(),
      name: 'NEW PLAN',
      price: 0,
      duration: '1 MONTH',
      features: ['UNLIMITED ACCESS']
    };
    updateService(serviceId, { plans: [...service.plans, newPlan] });
  };

  const handleRemovePlan = (serviceId: string, planId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    updateService(serviceId, { plans: service.plans.filter(p => p.id !== planId) });
  };

  const handleUpdatePlan = (serviceId: string, planId: string, updated: Partial<OTTPlan>) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    updateService(serviceId, {
      plans: service.plans.map(p => p.id === planId ? { ...p, ...updated } : p)
    });
  };

  const handleCreateService = () => {
    if (!newServiceName) return;
    const service: OTTService = {
      id: newServiceName.toLowerCase().replace(/\s/g, '-'),
      name: newServiceName,
      logo: newServiceLogo || 'https://via.placeholder.com/150',
      color: newServiceColor,
      plans: [],
      isRecommended: false
    };
    addService(service);
    setShowAddServiceModal(false);
    setNewServiceName('');
    setNewServiceLogo('');
  };

  const handleUpdateReview = (index: number, updated: Partial<Review>) => {
    const newReviews = [...settings.reviews];
    newReviews[index] = { ...newReviews[index], ...updated };
    setSettings({ ...settings, reviews: newReviews });
  };

  const exportToExcel = () => {
    if (orders.length === 0) {
      alert("Nothing to export yet!");
      return;
    }
    const headers = ["Order ID", "User Name", "Email", "Phone Number", "App Subscription", "Plan", "Amount", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...orders.map(o => [
        o.id,
        `"${o.userName}"`,
        `"${o.userEmail}"`,
        `"${o.userPhone || 'N/A'}"`,
        `"${o.ottName}"`,
        `"${o.planName}"`,
        o.amount,
        o.status,
        new Date(o.createdAt).toLocaleString().replace(/,/g, "")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `OTT_TRUSTED_DATA_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-10">
        <div>
          <h1 className="text-5xl font-heading font-black uppercase tracking-tighter italic flex items-center text-white">
            COMMAND <span className="text-primary ml-3">CENTER</span>
            <span className="ml-5 flex h-3 w-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          </h1>
          <p className="text-gray-500 font-bold mt-4 text-lg">Managing the OTT Trusted Empire.</p>
        </div>

        <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          {(['orders', 'services', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative z-10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                activeTab === tab ? 'bg-primary text-white shadow-2xl shadow-red-900/40' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <StatCard label="Live Orders" value={stats.total} icon="📊" />
              <StatCard label="Awaiting Approval" value={stats.pending} color="text-yellow-500" icon="⏳" />
              <StatCard label="Success Logs" value={stats.approved} color="text-green-500" icon="✅" />
              <StatCard label="Empire Revenue" value={`₹${stats.revenue}`} color="text-primary" icon="💰" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <div className="relative w-full max-w-lg">
                <input 
                  type="text"
                  placeholder="SEARCH ORDER VAULT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 focus:outline-none focus:border-primary transition-all text-xs font-black placeholder-gray-700 tracking-widest text-white"
                />
              </div>
              <button onClick={exportToExcel} className="flex items-center space-x-4 px-10 py-5 bg-green-600/10 text-green-500 border border-green-500/20 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-600 hover:text-white transition-all shadow-2xl">
                <span>EXPORT TO EXCEL</span>
              </button>
            </div>

            <div className="space-y-6">
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <div key={order.id} className="glass-morphism rounded-[3rem] p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 border border-white/5 hover:border-white/20 transition-all hover:bg-white/5 group shadow-xl">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">#{order.id}</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{order.ottName} <span className="text-gray-500 ml-2">[{order.planName}]</span></h3>
                    <p className="text-xs text-gray-600 font-bold mt-2">{order.userName} | {order.userEmail} | <span className="text-primary">{order.userPhone}</span></p>
                  </div>

                  <div className="flex items-center space-x-10 w-full lg:w-auto">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.3em] mb-2">AMOUNT</p>
                      <p className="text-4xl font-black italic text-white">₹{order.amount}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {order.proofImage && (
                        <button onClick={() => setSelectedOrderProof(order.proofImage!)} className="p-4 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      )}
                      {order.status === OrderStatus.PENDING ? (
                        <>
                          <button onClick={() => updateOrderStatus(order.id, OrderStatus.REJECTED)} className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">DENY</button>
                          <button onClick={() => updateOrderStatus(order.id, OrderStatus.APPROVED)} className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl shadow-red-900/40">GRANT ACCESS</button>
                        </>
                      ) : (
                        <div className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${order.status === OrderStatus.APPROVED ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}`}>
                          {order.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-40 glass-morphism rounded-[4rem] text-gray-700 font-black text-2xl uppercase italic border-dashed border-white/5">The Vault is Clean. No Orders found.</div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
            <div className="flex justify-between items-center mb-10 bg-white/5 p-8 rounded-[3rem] border border-white/5">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">APP CATALOG</h2>
              <button onClick={() => setShowAddServiceModal(true)} className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-200 transition-all shadow-2xl">NEW SERVICE</button>
            </div>

            {services.map(service => (
              <div key={service.id} className={`glass-morphism rounded-[4rem] p-12 border transition-all relative group/service overflow-hidden ${service.isRecommended ? 'border-yellow-500/40' : 'border-white/5'}`}>
                <div className="absolute top-8 right-8 flex space-x-4 opacity-0 group-hover/service:opacity-100 transition-all z-20">
                  <button 
                    onClick={() => updateService(service.id, { isRecommended: !service.isRecommended })}
                    className={`px-6 py-3 rounded-2xl transition-all border font-black text-[9px] uppercase tracking-widest ${service.isRecommended ? 'bg-yellow-500 text-black border-yellow-500/40 shadow-xl' : 'bg-white/5 text-gray-500 border-white/10 hover:text-yellow-500'}`}
                  >
                    ★ {service.isRecommended ? 'RECOMMENDED' : 'RECOMMEND'}
                  </button>
                  <button onClick={() => deleteService(service.id)} className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest">Delete</button>
                </div>

                <div className="flex items-center gap-12 mb-16 relative z-10">
                  <div className="shrink-0 w-32 h-32 bg-white/5 rounded-[2.5rem] p-6 flex items-center justify-center border border-white/10 group/logo transition-all hover:border-primary shadow-2xl">
                    <img src={service.logo} alt={service.name} className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                  </div>
                  <div className="flex-grow">
                    <input 
                      value={service.name} 
                      onChange={(e) => updateService(service.id, { name: e.target.value })} 
                      className="text-4xl font-black italic uppercase tracking-tighter bg-transparent border-b border-transparent focus:border-primary focus:outline-none w-full text-white" 
                    />
                    <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">{service.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {service.plans.map(plan => (
                    <div key={plan.id} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-white/20 transition-all shadow-xl">
                      <div className="flex justify-between items-start mb-6">
                        <input 
                          value={plan.name} 
                          onChange={(e) => handleUpdatePlan(service.id, plan.id, { name: e.target.value })} 
                          className="font-black text-2xl bg-transparent focus:outline-none w-full italic uppercase tracking-tighter text-white" 
                        />
                        <button onClick={() => handleRemovePlan(service.id, plan.id)} className="text-gray-600 hover:text-red-500 transition-colors">&times;</button>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center space-x-3">
                           <span className="text-xs font-black text-gray-600">₹</span>
                           <input type="number" value={plan.price} onChange={(e) => handleUpdatePrice(service.id, plan.id, parseInt(e.target.value) || 0)} className="bg-dark border border-white/10 rounded-2xl px-6 py-3 text-right font-black focus:outline-none focus:border-primary w-28 text-xl text-white" />
                        </div>
                        <input value={plan.duration} onChange={(e) => handleUpdatePlan(service.id, plan.id, { duration: e.target.value })} className="bg-dark border border-white/10 rounded-2xl px-6 py-3 text-xs font-black uppercase w-32 text-center text-white" />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => handleAddPlan(service.id)} className="border-2 border-dashed border-white/10 rounded-[3rem] p-12 text-gray-600 hover:border-primary/50 hover:text-primary transition-all font-black uppercase text-xs flex flex-col items-center justify-center">
                    <span className="text-2xl mb-2">+</span>
                    Add Archetype Plan
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            {/* Core Settings */}
            <div className="glass-morphism rounded-[4rem] p-16 border border-white/5 space-y-12 shadow-2xl">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">CORE SETTINGS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">WHATSAPP HOTLINE</label>
                  <input value={settings.whatsappNumber} onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 focus:outline-none focus:border-primary font-black text-lg text-white" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">UPI ID GATEWAY</label>
                  <input value={settings.upiId} onChange={(e) => setSettings({...settings, upiId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 focus:outline-none focus:border-primary font-black text-lg text-white" />
                </div>
              </div>
            </div>

            {/* CMS Settings */}
            <div className="glass-morphism rounded-[4rem] p-16 border border-white/5 space-y-12 shadow-2xl">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">CMS & MEDIA ARCHIVE</h3>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">DEMO MODAL VIDEO (YOUTUBE EMBED URL)</label>
                  <input value={settings.demoVideoUrl} onChange={(e) => setSettings({...settings, demoVideoUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 focus:outline-none focus:border-primary font-black text-white" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">HERO BG VIDEO (DIRECT .MP4 LINK)</label>
                  <input value={settings.heroVideoUrl} onChange={(e) => setSettings({...settings, heroVideoUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 focus:outline-none focus:border-primary font-black text-white" />
                </div>
              </div>
            </div>

            {/* Testimonials Management */}
            <div className="glass-morphism rounded-[4rem] p-16 border border-white/5 space-y-12 shadow-2xl">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">CLIENT FEEDBACK</h3>
              <div className="space-y-10">
                {settings.reviews.map((rev, idx) => (
                  <div key={rev.id} className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Reviewer Name</label>
                          <input value={rev.name} onChange={(e) => handleUpdateReview(idx, { name: e.target.value })} className="w-full bg-dark rounded-2xl px-6 py-3 focus:outline-none focus:border-primary font-bold text-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Avatar URL</label>
                          <input value={rev.avatar} onChange={(e) => handleUpdateReview(idx, { avatar: e.target.value })} className="w-full bg-dark rounded-2xl px-6 py-3 focus:outline-none focus:border-primary font-mono text-xs text-gray-400" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Review Body</label>
                       <textarea value={rev.review} onChange={(e) => handleUpdateReview(idx, { review: e.target.value })} className="w-full bg-dark rounded-2xl px-6 py-4 focus:outline-none focus:border-primary font-medium min-h-[100px] text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Modal */}
      <AnimatePresence>
        {selectedOrderProof && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrderProof(null)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-4xl bg-surface rounded-[5rem] overflow-hidden p-8 border border-white/10 shadow-2xl">
              <img src={selectedOrderProof} alt="Proof" className="max-w-full max-h-[80vh] object-contain mx-auto" />
              <button onClick={() => setSelectedOrderProof(null)} className="absolute top-8 right-8 text-3xl font-black bg-black/50 w-12 h-12 rounded-full flex items-center justify-center text-white">&times;</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Service Modal */}
      <AnimatePresence>
        {showAddServiceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddServiceModal(false)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="relative w-full max-w-md bg-surface rounded-[4rem] p-12 border border-white/10 shadow-2xl">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-white">New Service</h3>
              <div className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block">App Name</label>
                   <input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary text-white" placeholder="e.g. Netflix" />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Logo URL</label>
                   <input value={newServiceLogo} onChange={(e) => setNewServiceLogo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary text-white" placeholder="https://..." />
                 </div>
                 <button onClick={handleCreateService} className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-red-900/40 hover:bg-red-700 uppercase tracking-widest text-xs">Initialize Service</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, color = "text-white", icon }: { label: string, value: string | number, color?: string, icon?: string }) => (
  <div className="glass-morphism p-12 rounded-[3.5rem] border border-white/5 relative group overflow-hidden shadow-2xl">
    <div className="absolute -bottom-10 -left-10 text-9xl opacity-5 pointer-events-none group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-6 relative z-10">{label}</p>
    <p className={`text-5xl font-black italic tracking-tighter relative z-10 ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;
