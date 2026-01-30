
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User, UserRole, Order, OrderStatus, OTTService, AppSettings, OTTPlan, Review } from './types';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import PaymentPage from './pages/PaymentPage';
import { ADMIN_CREDENTIALS, SERVICES as DEFAULT_SERVICES, WHATSAPP_NUMBER as DEFAULT_WA } from './constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, phone: string, pass: string) => void;
  logout: () => void;
  orders: Order[];
  placeOrder: (ottName: string, planName: string, amount: number, proofAttached: boolean, proofImage?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  services: OTTService[];
  setServices: React.Dispatch<React.SetStateAction<OTTService[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  addService: (service: OTTService) => void;
  deleteService: (id: string) => void;
  updateService: (id: string, updated: Partial<OTTService>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const DEFAULT_REVIEWS: Review[] = [
  { id: '1', name: "Rahul Sharma", role: "Elite Streamer", review: "Instant activation. I was watching Netflix in 4K within 5 minutes. Highly recommend OTT Trusted!", avatar: "https://i.pravatar.cc/150?u=rahul" },
  { id: '2', name: "Sneha Kapoor", role: "Movie Buff", review: "The support is actually human and very helpful. Had a small issue with login and it was fixed in minutes.", avatar: "https://i.pravatar.cc/150?u=sneha" },
  { id: '3', name: "Arjun Verma", role: "Cricket Fan", review: "Hotstar premium for the IPL was seamless. Best price in the market with guaranteed uptime.", avatar: "https://i.pravatar.cc/150?u=arjun" }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [services, setServices] = useState<OTTService[]>(() => {
    const saved = localStorage.getItem('appServices');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });
useEffect(() => {
  const syncServices = () => {
    const saved = localStorage.getItem('appServices');
    if (saved) {
      setServices(JSON.parse(saved));
    }
  };

  window.addEventListener('storage', syncServices);

  return () => {
    window.removeEventListener('storage', syncServices);
  };
}, []);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    const baseSettings = {
      whatsappNumber: DEFAULT_WA,
      upiId: 'otttrusted@upi',
      heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-popcorn-falling-onto-a-table-in-slow-motion-4433-large.mp4',
      reviews: DEFAULT_REVIEWS
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...baseSettings, ...parsed };
      } catch (e) {
        return baseSettings;
      }
    }
    return baseSettings;
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('appServices', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const login = (email: string, pass: string) => {
    if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
      const adminUser: User = { id: 'admin-0', name: 'System Administrator', email, phone: '000', role: UserRole.ADMIN };
      setUser(adminUser);
      localStorage.setItem('currentSession', JSON.stringify(adminUser));
      return true;
    }

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const found = users.find((u: User) => u.email === email && u.password === pass);
    if (found) {
      setUser(found);
      localStorage.setItem('currentSession', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, phone: string, pass: string) => {
    const newUser: User = { 
      id: Date.now().toString(), 
      name, 
      email, 
      phone, 
      password: pass, 
      role: UserRole.CLIENT 
    };
    const existing = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    localStorage.setItem('registeredUsers', JSON.stringify([...existing, newUser]));
    setUser(newUser);
    localStorage.setItem('currentSession', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentSession');
    navigate('/');
  };

  const placeOrder = (ottName: string, planName: string, amount: number, proofAttached: boolean, proofImage?: string) => {
    if (!user) return;
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      ottName,
      planName,
      amount,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      proofAttached,
      proofImage
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const addService = (service: OTTService) => {
    setServices(prev => [...prev, service]);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const updateService = (id: string, updated: Partial<OTTService>) => {
  setServices(prev => {
    const newServices = prev.map(s =>
      s.id === id ? { ...s, ...updated } : s
    );

    // 🔥 force localStorage sync immediately
    localStorage.setItem('appServices', JSON.stringify(newServices));

    return newServices;
  });
};


  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, orders, placeOrder, updateOrderStatus,
      services, setServices, settings, setSettings, addService, deleteService, updateService
    }}>
      <div className="min-h-screen flex flex-col bg-dark selection:bg-primary/30 font-sans">
        <Navbar />
        <main className="flex-grow relative z-10">
          <AnimatePresence mode="wait" >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout" element={user ? <PaymentPage /> : <Navigate to="/login" />} />
              <Route path="/my-orders" element={user ? <MyOrders /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </main>
        <footer className="py-12 text-center text-gray-500 border-t border-white/5 bg-dark relative z-10">
          <div className="mb-6 flex justify-center space-x-8 text-[10px] md:text-xs uppercase tracking-widest font-bold">
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            <span className="cursor-pointer hover:text-white transition-colors">Refund Policy</span>
          </div>
          <p className="text-sm">© 2025 OTT Trusted. The ultimate destination for premium streaming.</p>
        </footer>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
