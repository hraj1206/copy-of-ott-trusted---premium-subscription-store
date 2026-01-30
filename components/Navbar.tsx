
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { UserRole } from '../types';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 glass-morphism px-4 md:px-12 py-5 flex justify-between items-center border-b border-white/5">
      <Link to="/">
        <Logo size="md" />
      </Link>

      <div className="flex items-center space-x-8">
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
          {/* <a href="#how-it-works" className="text-sm font-bold text-gray-400 hover:text-white transition-colors relative group">
            How it Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </a> */}
          {/* <a href="#services" className="text-sm font-bold text-gray-400 hover:text-white transition-colors relative group">
            Browse Apps
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </a> */}
        </div>

        {user ? (
          <div className="flex items-center space-x-4 bg-white/5 p-1 rounded-full border border-white/10 pl-4">
            <span className="text-xs text-gray-400 font-bold hidden sm:inline">Welcome, {user.name.split(' ')[0]}</span>
            <div className="flex items-center space-x-2">
              {user.role === UserRole.CLIENT ? (
                <Link 
                  to="/my-orders" 
                  className="px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-full hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                >
                  Orders
                </Link>
              ) : (
                <Link 
                  to="/admin" 
                  className="px-4 py-2 bg-red-600 text-white text-xs font-black rounded-full hover:bg-red-700 transition-all uppercase tracking-widest shadow-lg shadow-red-900/40"
                >
                  Panel
                </Link>
              )}
              <button 
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:bg-red-700 transition-all transform hover:scale-105 shadow-xl shadow-red-900/30 uppercase tracking-tighter text-sm italic">
              Join Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
