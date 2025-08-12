import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import FacilityHeader from './FacilityHeader';

interface FacilityOwnerLayoutProps {
  children: React.ReactNode;
}

const FacilityOwnerLayout: React.FC<FacilityOwnerLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* Sidebar - Always visible on lg screens, conditionally visible on smaller screens */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            isOpen={true} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col lg:ml-64">
          <FacilityHeader 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Debug log for layout rendering */}
              {/* Using a self-executing function to avoid void return type */}
              {(() => { console.log('FacilityOwnerLayout rendering children'); return null; })()}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FacilityOwnerLayout;
