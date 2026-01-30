
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { OTTService, OTTPlan } from '../types';

const CountUp: React.FC<{ end: number, duration?: number, suffix?: string }> = ({ end, duration = 2.5, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!inView) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);

  return (
    <motion.span 
      ref={nodeRef} 
      onViewportEnter={() => setInView(true)}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
};

const SectionHeader: React.FC<{ title: string; subtitle: string; primary?: string }> = ({ title, subtitle, primary }) => (
  <div className="text-center mb-12 md:mb-20 px-4">
    <motion.h2 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-7xl font-heading font-black mb-6 uppercase italic tracking-tighter text-white"
    >
      {title} <span className="text-primary">{primary}</span>
    </motion.h2>
    <p className="text-gray-500 font-bold max-w-2xl mx-auto text-sm md:text-base">{subtitle}</p>
    <motion.div 
      initial={{ width: 0 }}
      whileInView={{ width: "6rem" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="h-2 bg-primary mx-auto rounded-full mt-6" 
    />
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { services, settings } = useAuth();
  const [selectedService, setSelectedService] = useState<OTTService | null>(null);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);

  // Sort services so recommended ones are at the top
  const sortedServices = [...services].sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return 0;
  });

  const names = [
  "Rahul S.", "Priya V.", "Amit K.", "Sneha M.", "Zoya T.", "Vikram J.",
  "Aarav P.", "Ishan B.", "Meera L.", "Karan W.", "Deepak R.", "Anjali G.",
  "Rohit D.", "Neha C.", "Siddharth N.", "Pooja A.", "Harsh V.", "Nikhil R.",
  "Simran K.", "Akash M.", "Tanvi S.", "Mohit J.", "Ira P.", "Kabir T.",
  "Riya G.", "Manish L.", "Shreya D.", "Aditya B.", "Kritika N.", "Yash P.",
  "Lavanya M.", "Saurabh K.", "Divya R.", "Arjun S.", "Palak V.", "Sahil A.",
  "Naina T.", "Varun G.", "Muskan P.", "Ayush M.", "Pankaj R.", "Tanya K.",
  "Raghav N.", "Bhavya S.", "Kunal D.", "Ayesha M.", "Ritesh P.", "Komal J.",
  "Abhinav L.", "Nandini G."
];

const getRandom = <T,>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const [tickerData, setTickerData] = useState(() => ({
  name: getRandom(names),
  app: "Netflix Elite",
  time: "just now"
}));

useEffect(() => {
  const apps = services.map(s => s.name);
  let lastName = tickerData.name;

  const interval = setInterval(() => {
    let newName;

    do {
      newName = getRandom(names);
    } while (newName === lastName);

    lastName = newName;

    const randomApp = getRandom(apps) || "Premium Subscription";

    setTickerData({
      name: newName,
      app: randomApp,
      time: "just now"
    });
  }, 5000);

  return () => clearInterval(interval);
}, [services]);


  return (
    <div className="relative selection:bg-primary/50 overflow-x-hidden">
      {/* Permanent Automated Activation Ticker */}
      <div className="fixed bottom-6 left-6 z-[60] hidden md:block">
        <AnimatePresence mode="wait">
           <motion.div 
             key={tickerData.name + tickerData.app}
             initial={{ x: -100, opacity: 0, scale: 0.8 }}
             animate={{ x: 0, opacity: 1, scale: 1 }}
             exit={{ x: 100, opacity: 0, scale: 0.9 }}
             transition={{ type: "spring", stiffness: 120, damping: 14 }}
             className="bg-black/90 backdrop-blur-3xl border border-primary/20 rounded-[2rem] p-5 flex items-center space-x-5 shadow-[0_20px_50px_rgba(229,9,20,0.2)] border-l-4 border-l-primary"
           >
              <div className="relative">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl italic border border-primary/20">
                  {tickerData.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
              </div>
              <div className="pr-4">
                 <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-0.5">Live Activation</p>
                 <p className="text-white text-sm font-bold tracking-tight leading-tight">
                   {tickerData.name} <span className="text-gray-500 font-medium italic">unlocked</span> <br/>
                   <span className="text-primary font-black uppercase text-[10px]">{tickerData.app}</span>
                 </p>
              </div>
           </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-15 scale-110"
            alt="Cinema Ambience"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/0 via-dark/40 to-dark" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3 mb-6 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Authorized Premium Distributor</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-[10rem] font-heading font-black mb-8 leading-[0.85] tracking-tighter italic text-white"
          >
            WATCH <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-primary">
              BEYOND.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-3xl text-gray-400 mb-12 max-w-4xl mx-auto font-medium leading-relaxed px-4"
          >
            Experience pure 4K cinema at 70% off. Legit slots, private profiles, 
            and <span className="text-white font-black italic">Instant Global Activation</span>.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.7 }}
             className="flex flex-col sm:flex-row justify-center gap-6 px-4"
          >
            <motion.a 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/my-orders")} 
              className="px-10 py-6 bg-primary text-white font-black rounded-[2rem] shadow-2xl shadow-primary/40 text-lg md:text-xl uppercase italic tracking-tighter"
            >
              Access the Vault
            </motion.a>
            {/* <motion.button 
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", scale: 1.05 }}
              onClick={() => setShowDemoVideo(true)}
              className="px-10 py-6 bg-white/5 border border-white/10 text-white font-black rounded-[2rem] transition-all text-lg md:text-xl backdrop-blur-xl group flex items-center justify-center space-x-4"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span>Watch Demo</span>
            </motion.button> */}
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-white/5 bg-white/2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-12 px-12">
              <span className="text-sm font-black text-gray-700 uppercase tracking-[0.5em]">Real 4K Cinema</span>
              <span className="text-sm font-black text-gray-700 uppercase tracking-[0.5em]">Private Slots</span>
              <span className="text-sm font-black text-gray-700 uppercase tracking-[0.5em]">24/7 Activation</span>
              <span className="text-sm font-black text-gray-700 uppercase tracking-[0.5em]">Lifetime Warranty</span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Center */}
      <section className="py-24 md:py-48 px-4 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-8xl font-heading font-black mb-8 leading-tight italic uppercase tracking-tighter text-white">
              ELITE <br /><span className="text-primary">PROTOCOL.</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-12 font-medium leading-relaxed">
              We manage thousands of enterprise-grade slots to ensure you get 
              uninterrupted 4K access. No more "too many devices" errors.
            </p>
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {[
                { label: 'Verified Users', value: 54300, suffix: '+', icon: '🫂' },
                { label: 'Uptime Score', value: 99.9, suffix: '%', icon: '💎' },
                { label: 'Global Servers', value: 120, suffix: '+', icon: '🌍' },
                { label: 'Support Speed', value: 10, suffix: 'm', icon: '⚡' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8, borderColor: "rgba(229,9,20,0.6)" }}
                  className="p-6 md:p-10 glass-morphism rounded-[3rem] border border-white/5 transition-all bg-gradient-to-br from-white/5 to-transparent"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl">{item.icon}</span>
                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">{item.label}</p>
                  </div>
                  <p className="text-3xl md:text-5xl font-black text-white italic">
                    <CountUp end={item.value} suffix={item.suffix} />
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="relative group"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
            <div className="glass-morphism p-3 rounded-[5rem] border-white/10 shadow-[0_0_100px_rgba(229,9,20,0.2)] relative overflow-hidden aspect-video flex items-center justify-center bg-black/90">
               <video 
                 key={settings.heroVideoUrl}
                 autoPlay 
                 muted 
                 loop 
                 playsInline 
                 className="w-full h-full object-cover rounded-[4.2rem] opacity-70 group-hover:opacity-100 transition-opacity duration-1000"
               >
                 <source src={settings.heroVideoUrl} type="video/mp4" />
                 <img src="https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover rounded-[4.2rem]" alt="Video Fallback" />
               </video>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(229,9,20,0.8)] border-4 border-white/20"
                  >
                     <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </motion.div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 px-4 md:px-8 max-w-7xl mx-auto bg-dark/50 rounded-[4rem] md:rounded-[6rem] border border-white/5 my-20 shadow-inner relative">
        <div className="absolute top-0 right-0 p-20 bg-primary/5 blur-[150px] pointer-events-none" />
        <SectionHeader 
          title="PREMIUM" 
          primary="CATALOG" 
          subtitle="Direct activation slots for the most desired platforms. Select your archetype to continue." 
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {sortedServices.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -20, scale: 1.03 }}
              onClick={() => setSelectedService(service)}
              className={`glass-morphism rounded-[3.5rem] p-10 md:p-14 cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center text-center shadow-2xl border ${
                service.isRecommended ? 'border-yellow-500/40' : 'border-white/5'
              } hover:border-primary/50`}
            >
              {service.isRecommended && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-4 py-1.5 bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    ★ TOP PICK
                  </span>
                </div>
              )}
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity blur-[100px] pointer-events-none" 
                style={{ backgroundColor: service.isRecommended ? '#EAB308' : service.color }}
              />
              <motion.img 
                whileHover={{ scale: 1.2, rotate: 5 }}
                src={service.logo} 
                alt={service.name} 
                className="h-20 md:h-28 object-contain mb-10 md:mb-14 transition-transform duration-700 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
              />
              <h3 className="text-2xl md:text-3xl font-black mb-4 italic tracking-tighter uppercase text-white">{service.name}</h3>
              <p className="text-gray-500 text-[9px] mb-10 md:mb-14 font-black tracking-[0.4em] uppercase">Starting at ₹{service.plans.length > 0 ? Math.min(...service.plans.map(p => p.price)) : '---'}</p>
              
              <div className={`mt-auto w-full py-5 ${service.isRecommended ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5'} group-hover:bg-primary group-hover:text-white rounded-[2rem] font-black transition-all border ${service.isRecommended ? 'border-yellow-500/20' : 'border-white/10'} uppercase tracking-[0.2em] text-[10px]`}>
                Browse Plans
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Feedback Section */}
      <section className="py-32 bg-white/2 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader title="THE" primary="FEEDBACK" subtitle="Trusted by thousands of cinephiles worldwide. Here's what they say." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {settings.reviews.map((t, i) => (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-12 glass-morphism rounded-[4rem] border-white/5 relative group hover:bg-white/5 transition-all shadow-2xl"
              >
                <div className="absolute top-[-35px] left-12 p-1.5 bg-dark rounded-[2rem] border border-white/10 shadow-2xl">
                   <img src={t.avatar} className="w-16 h-16 rounded-[1.5rem] grayscale group-hover:grayscale-0 transition-all duration-700 object-cover" alt={t.name} />
                </div>
                <div className="flex text-yellow-500 mb-8 mt-6">{"★".repeat(5)}</div>
                <p className="text-gray-300 text-xl mb-10 leading-relaxed font-medium italic">"{t.review}"</p>
                <div>
                   <p className="text-white font-black uppercase tracking-widest text-xs tracking-tighter">{t.name}</p>
                   <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-1.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/98 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-6xl bg-surface rounded-[3rem] md:rounded-[5rem] overflow-hidden border-2 border-white/10 shadow-[0_0_150px_rgba(229,9,20,0.3)] flex flex-col max-h-[92vh]"
            >
              <div className="p-6 md:p-20 overflow-y-auto w-full custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-10 md:gap-24">
                  {/* Service Info */}
                  <div className="md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                    <motion.img 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      src={selectedService.logo} 
                      alt={selectedService.name} 
                      className="h-20 md:h-36 object-contain mb-8 md:mb-16 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                    />
                    <h2 className="text-4xl md:text-7xl font-black mb-8 md:mb-12 leading-tight italic tracking-tighter uppercase text-white">
                      {selectedService.name} <br /><span className="text-primary">EDITION</span>
                    </h2>
                  </div>

                  {/* Plans */}
                  <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {selectedService.plans.map((plan, i) => (
                      <motion.div 
                        key={plan.id}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className="glass-morphism p-8 md:p-12 rounded-[3.5rem] flex flex-col border-white/5 shadow-2xl relative overflow-hidden group/plan border-l-primary/10 hover:border-l-primary/100 transition-all"
                      >
                        <div className="flex flex-col mb-10">
                          <div className="flex justify-between items-start mb-6 gap-3">
                            <h4 className="font-black text-xl md:text-3xl uppercase italic tracking-tighter leading-tight flex-grow text-white">{plan.name}</h4>
                            <span className="text-primary text-[9px] font-black bg-primary/10 px-4 py-2 rounded-full uppercase tracking-widest whitespace-nowrap shadow-xl border border-primary/20">{plan.duration}</span>
                          </div>
                          <div className="bg-dark/50 p-6 rounded-[2rem] border border-white/5 text-center flex flex-col justify-center items-center shadow-inner group-hover/plan:bg-primary/5 transition-colors">
                             <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-2">Investment</span>
                             <div className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
                               ₹{plan.price}
                             </div>
                          </div>
                        </div>

                        <ul className="space-y-4 mb-12 flex-grow">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="text-xs text-gray-400 font-bold flex items-start">
                              <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary mr-4 text-[10px] font-black flex-shrink-0 mt-0.5">✓</span>
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <button 
                          onClick={() => {
                            navigate('/checkout', { state: { service: selectedService.name, plan: plan } });
                          }}
                          className="w-full py-5 md:py-7 bg-primary text-white font-black rounded-[2.2rem] hover:bg-red-700 shadow-[0_15px_40px_rgba(229,9,20,0.4)] transform active:scale-95 transition-all text-sm md:text-xl uppercase tracking-tighter italic"
                        >
                          UNLOCK NOW
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedService(null)}
                className="w-full py-6 bg-surface border-t border-white/10 text-gray-500 font-black uppercase text-[10px] tracking-[0.4em] hover:text-white transition-colors"
              >
                CLOSE PROTOCOL
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Demo Video Modal */}
      <AnimatePresence>
         {showDemoVideo && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowDemoVideo(false)}
                 className="absolute inset-0 bg-black/98 backdrop-blur-2xl"
               />
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.8, opacity: 0 }}
                 className="relative w-full max-w-5xl aspect-video bg-black rounded-[3rem] md:rounded-[5rem] overflow-hidden border-2 border-white/10 shadow-[0_0_150px_rgba(229,9,20,0.5)]"
               >
                  <iframe 
                    className="w-full h-full"
                    src={settings.demoVideoUrl} 
                    title="OTT Trusted Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button 
                    onClick={() => setShowDemoVideo(false)}
                    className="absolute top-8 right-8 w-14 h-14 bg-black/60 hover:bg-primary rounded-full flex items-center justify-center text-white transition-all text-3xl shadow-2xl backdrop-blur-xl border border-white/10"
                  >
                    &times;
                  </button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E50914; border-radius: 10px; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
