import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, ArrowRightIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
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
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Join SecureChat</h2>
        <p className="text-gray-300">Enter your username to start chatting securely</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6"
        >
          <p className="text-red-200 text-sm text-center">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="input-modern w-full pl-10 pr-4"
            disabled={isLoading}
            maxLength={20}
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={!username.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>Start Chatting</span>
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <motion.button
          type="button"
          onClick={handleRunTests}
          disabled={isRunningTests || isLoading}
          className="btn-secondary w-full flex items-center justify-center space-x-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRunningTests ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Running Tests...</span>
            </>
          ) : (
            <>
              <WrenchScrewdriverIcon className="w-5 h-5" />
              <span>Test E2EE System</span>
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          🔒 All messages are end-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
