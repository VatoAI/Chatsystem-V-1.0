import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, ArrowRightIcon, WrenchScrewdriverIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { runFullIntegrationTest } from '../lib/integrationTests';

interface LoginFormProps {
  onLogin: (username: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.trim()) {
      await onLogin(username.trim());
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    console.log('🧪 Running integration tests...');
    const success = await runFullIntegrationTest();
    setIsRunningTests(false);
    
    if (success) {
      alert('✅ All tests passed! The E2EE chat system is working correctly.');
    } else {
      alert('❌ Some tests failed. Check the console for details.');
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-200 text-sm font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 z-10" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-2xl transition-all duration-300"
                disabled={isLoading}
                maxLength={20}
                required
              />
            </div>
          </div>
        </motion.div>

        <motion.button
          type="submit"
          disabled={!username.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
              />
              <span className="font-semibold">Connecting...</span>
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-6 h-6" />
              <span className="font-semibold">Start Secure Chat</span>
              <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center space-x-4"
        >
          <div className="h-px bg-white/20 flex-1"></div>
          <span className="text-white/60 text-sm font-medium">Developer Tools</span>
          <div className="h-px bg-white/20 flex-1"></div>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleRunTests}
          disabled={isRunningTests || isLoading}
          className="btn-secondary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isRunningTests ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Running Integration Tests...</span>
            </>
          ) : (
            <>
              <WrenchScrewdriverIcon className="w-4 h-4" />
              <span>Run System Tests</span>
            </>
          )}
        </motion.button>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center space-x-2 text-white/40 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Quantum-safe encryption enabled</span>
        </div>
        <div className="flex items-center justify-center space-x-4 text-white/30 text-xs">
          <span>RSA-4096</span>
          <span>•</span>
          <span>ML-KEM</span>
          <span>•</span>
          <span>AES-256-GCM</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
