
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { OrderStatus } from '../types';

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case OrderStatus.PENDING: 
        return { 
          bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500', 
          glow: 'rgba(234, 179, 8, 0.4)',
          dot: 'bg-yellow-500' 
        };
      case OrderStatus.APPROVED: 
        return { 
          bg: 'bg-green-500/10 border-green-500/20 text-green-500', 
          glow: 'rgba(34, 197, 94, 0.4)',
          dot: 'bg-green-500' 
        };
      case OrderStatus.REJECTED: 
        return { 
          bg: 'bg-red-500/10 border-red-500/20 text-red-500', 
          glow: 'rgba(239, 68, 68, 0.4)',
          dot: 'bg-red-500' 
        };
    }
  };

  const { bg, glow, dot } = getStyles();

  return (
    <motion.div 
      animate={{ 
        boxShadow: [`0 0 5px ${glow}`, `0 0 20px ${glow}`, `0 0 5px ${glow}`],
        scale: status === OrderStatus.PENDING ? [1, 1.05, 1] : 1
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className={`px-6 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 backdrop-blur-3xl ${bg}`}
    >
      <motion.span 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${dot} shadow-[0_0_10px_${glow}]`} 
      />
      <span>{status}</span>
    </motion.div>
  );
};

const CountdownTimer: React.FC<{ createdAt: string }> = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const createdTime = new Date(createdAt).getTime();
      const endTime = createdTime + 30 * 60 * 1000;
      const now = new Date().getTime();
      const diff = Math.max(0, endTime - now);
      setTimeLeft(diff);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (timeLeft <= 0) {
    return (
      <motion.div 
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex items-center space-x-2"
      >
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(229,9,20,0.5)]" />
        <span className="text-[10px] text-primary font-black uppercase tracking-widest italic">Live Activation...</span>
      </motion.div>
    );
  }

  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="text-right">
      <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.2em] mb-1">Queue Priority</p>
      <div className="text-2xl md:text-3xl font-black font-mono text-white flex items-center justify-end space-x-2 italic">
        <span>{minutes.toString().padStart(2, '0')}</span>
        <span className="animate-pulse text-primary">:</span>
        <span>{seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

const MyOrders: React.FC = () => {
  const { user, orders } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  
  const myOrders = orders.filter(o => {
    const isMine = o.userId === user?.id;
    const matchesFilter = statusFilter === 'ALL' || o.status === statusFilter;
    return isMine && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10"
      >
        <div>
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-4 uppercase tracking-tighter italic">VAULT <span className="text-primary">ACCESS</span></h1>
          <div className="flex flex-wrap items-center gap-4">
             <p className="text-gray-400 font-bold text-lg">Manage your premium credentials.</p>
             <div className="flex items-center space-x-3 px-5 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[10px] text-primary font-black uppercase tracking-widest">Global Sync Active</span>
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl w-full md:w-auto">
          {['ALL', OrderStatus.PENDING, OrderStatus.APPROVED, OrderStatus.REJECTED].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f as any)}
              className={`flex-grow md:flex-none px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em] ${
                statusFilter === f ? 'bg-primary text-white shadow-xl shadow-red-900/40' : 'text-gray-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {myOrders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-40 glass-morphism rounded-[4rem] border-dashed border-white/10"
        >
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-primary/10">
            <svg className="w-12 h-12 text-primary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Vault Sealed</h3>
          <p className="text-gray-500 mt-6 max-w-sm mx-auto font-bold text-lg leading-relaxed">Your subscription vault is empty. Pick a premium archetype to begin.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-10 px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-[10px]"
          >
            Explore Vault
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {myOrders.map((order, i) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass-morphism rounded-[4rem] p-10 md:p-12 relative overflow-hidden group border border-white/5 hover:border-primary/50 transition-all flex flex-col shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">#{order.id}</span>
                    <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">{order.ottName}</h3>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                
                <div className="mb-12 relative z-10">
                   <p className="text-gray-300 font-black text-xl mb-5 uppercase tracking-tighter italic">{order.planName}</p>
                   <div className="flex flex-wrap gap-2">
                      <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] text-green-500 font-black uppercase tracking-widest">Private Slot</div>
                      <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] text-blue-500 font-black uppercase tracking-widest">4K Vision</div>
                   </div>
                </div>
                
                <div className="mt-auto pt-10 border-t border-white/5 flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-2">Investment</p>
                    <p className="text-3xl md:text-4xl font-black text-white italic">₹{order.amount}</p>
                  </div>
                  
                  {order.status === OrderStatus.PENDING ? (
                    <CountdownTimer createdAt={order.createdAt} />
                  ) : (
                    <div className="text-right">
                      <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-2">Date Finalized</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {order.status === OrderStatus.APPROVED && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-10 p-6 bg-green-500/5 border border-green-500/20 rounded-[2rem] flex items-center space-x-6 relative z-10"
                  >
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="text-[9px] text-green-500 font-black uppercase tracking-[0.3em] mb-1">Access Granted</p>
                      <p className="text-[11px] text-gray-400 font-bold leading-tight">Credentials shared via secure WhatsApp channel.</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
