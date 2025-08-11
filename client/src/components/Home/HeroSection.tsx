import React from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-sky-700 to-blue-800 text-white">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-10 -left-10 h-56 w-56 rounded-full bg-emerald-400 blur-3xl animate-float" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-sky-400 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            <span className="text-white">Find</span> <span className="text-gradient">& Book</span> Sports Venues
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl mt-4 text-emerald-50"
          >
            Discover local facilities and get playing today
          </motion.p>

          {/* Quick Search */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-10 glass rounded-xl p-4 md:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full pl-10 pr-3 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center shadow-sporty transition-all">
                <Search className="mr-2 h-5 w-5" />
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;