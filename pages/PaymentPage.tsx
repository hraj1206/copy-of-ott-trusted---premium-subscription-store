
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { OTTPlan } from '../types';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, placeOrder, settings } = useAuth();
  
  // Safely handle null state to prevent destructuring error
  const state = location.state as { service: string, plan: OTTPlan } | null;

  useEffect(() => {
    if (!state || !state.service || !state.plan) {
      navigate('/');
    }
  }, [state, navigate]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [proof, setProof] = useState<File | null>(null);
  const [proofBase64, setProofBase64] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state || !state.service || !state.plan) {
    return null;
  }

  const { service, plan } = state;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaid = () => {
    if (!proof) {
      alert("Please upload payment screenshot proof first.");
      return;
    }

    setIsProcessing(true);
    
    const message = `Hello OTT Trusted Team! 🚀\n\nI want to confirm my OTT order.\n\nName: ${user?.name}\nEmail: ${user?.email}\nOTT App: ${service}\nPlan: ${plan.name}\nAmount: ₹${plan.price}\n\n✅ Payment Screenshot: Attached in system.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;

    placeOrder(service, plan.name, plan.price, true, proofBase64);

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      navigate('/my-orders');
      setIsProcessing(false);
    }, 2000);
  };

  const qrData = `upi://pay?pa=${settings.upiId}&am=${plan.price}&cu=INR&tn=OTTTrusted_${service}`;

  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
         <h1 className="text-4xl font-heading font-extrabold mb-4 uppercase tracking-tighter italic">Checkout</h1>
         <p className="text-gray-400 font-medium">Verify your payment to activate {service} Premium.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        <div className="glass-morphism p-10 rounded-[3rem] border-primary/20 relative overflow-hidden group">
          <div className="absolute top-6 right-8 text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full">Step 01</div>
          <h2 className="text-2xl font-bold mb-8 flex items-center uppercase tracking-tighter">
             Scan & Pay
          </h2>
          
          <div className="bg-white p-6 rounded-[2.5rem] w-64 h-64 mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(229,9,20,0.1)] group-hover:scale-105 transition-transform duration-500">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`} 
              alt="QR Code" 
              className="w-full h-full"
            />
          </div>

          <div className="text-center mb-10">
            <p className="text-[10px] text-gray-500 mb-2 font-black uppercase tracking-widest">Click to Copy UPI ID</p>
            <div 
              onClick={() => {
                navigator.clipboard.writeText(settings.upiId);
                alert("UPI ID Copied!");
              }}
              className="inline-flex items-center space-x-3 bg-white/5 px-6 py-4 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all active:scale-95 group"
            >
              <span className="font-mono font-black text-white text-lg tracking-wider group-hover:text-primary transition-colors">{settings.upiId}</span>
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <h4 className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-widest">Order Summary</h4>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 font-bold">{service} {plan.name}</span>
              <span className="font-black">₹{plan.price}</span>
            </div>
            <div className="flex justify-between text-primary font-black text-xl pt-4 border-t border-white/10 mt-4">
              <span>Grand Total</span>
              <span>₹{plan.price}</span>
            </div>
          </div>
        </div>

        <div className="glass-morphism p-10 rounded-[3rem] border-white/10 relative overflow-hidden flex flex-col">
          <div className="absolute top-6 right-8 text-gray-500 font-bold text-xs uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">Step 02</div>
          <h2 className="text-2xl font-bold mb-8 flex items-center uppercase tracking-tighter">
             Attach Proof
          </h2>

          <div className="flex-grow space-y-6">
            <div className="space-y-4">
               <p className="text-sm text-gray-400 font-bold leading-relaxed">
                 Instant activation requires proof. Upload your payment screenshot below.
               </p>
               
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleFileChange}
               />

               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`border-2 border-dashed rounded-[3rem] p-12 text-center cursor-pointer transition-all duration-500 ${
                   proof ? 'border-green-500 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'border-white/10 hover:border-primary/50 hover:bg-primary/5'
                 }`}
               >
                 {proof ? (
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-500 rounded-[1.5rem] flex items-center justify-center text-white mb-4 shadow-xl shadow-green-900/30">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-white font-black truncate max-w-[200px]">{proof.name}</p>
                      <button onClick={(e) => {e.stopPropagation(); setProof(null); setProofBase64(undefined);}} className="text-[10px] text-gray-500 mt-4 uppercase font-black tracking-widest hover:text-white transition-colors">Change Image</button>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center group">
                      <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 text-gray-500 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </div>
                      <p className="font-black text-white uppercase tracking-tighter text-xl">Upload Screenshot</p>
                      <p className="text-xs text-gray-500 mt-2 font-bold">JPEG or PNG (Max 5MB)</p>
                   </div>
                 )}
               </div>
            </div>

            <div className="bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/20 flex items-start space-x-4">
               <span className="text-2xl">⚡</span>
               <p className="text-xs text-blue-300 leading-relaxed font-bold italic">
                 Once you click "I Have Paid", a pre-filled WhatsApp message will open. Send it to initiate instant account activation.
               </p>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <button 
              onClick={handlePaid}
              disabled={isProcessing}
              className="w-full py-6 bg-green-600 text-white font-black rounded-3xl hover:bg-green-700 transition-all shadow-2xl shadow-green-900/40 flex items-center justify-center space-x-4 disabled:opacity-50 active:scale-95 uppercase tracking-tighter text-lg"
            >
              {isProcessing ? (
                <span className="flex items-center">
                   <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Processing...
                </span>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.249-3.719c1.554.921 3.088 1.408 4.671 1.409 5.432 0 9.852-4.42 9.855-9.852.002-2.631-1.025-5.106-2.891-6.972-1.866-1.865-4.341-2.891-6.971-2.892-5.432 0-9.852 4.421-9.855 9.853 0 1.653.442 3.262 1.282 4.671l-.999 3.65 3.733-.979zm11.45-6.98c-.314-.157-1.859-.918-2.146-1.022-.288-.105-.497-.157-.706.157-.209.314-.811 1.022-.994 1.231-.183.209-.366.236-.68.079-.314-.157-1.325-.488-2.524-1.558-.933-.832-1.563-1.859-1.746-2.173-.183-.314-.02-.484.137-.641.141-.14.314-.366.471-.55.157-.183.209-.314.314-.524.105-.209.052-.392-.026-.55-.078-.157-.706-1.701-.968-2.33-.255-.612-.516-.529-.706-.539-.183-.01-.392-.012-.602-.012s-.55.078-.837.392c-.287.314-1.099 1.073-1.099 2.618 0 1.545 1.125 3.037 1.282 3.246.157.209 2.214 3.382 5.362 4.742.749.324 1.334.517 1.789.661.752.239 1.437.205 1.977.124.602-.091 1.859-.759 2.121-1.492.261-.733.261-1.361.183-1.492-.078-.131-.287-.209-.601-.366z"/></svg>
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
