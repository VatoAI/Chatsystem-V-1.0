'use client';
import { motion } from 'framer-motion';
import LoginPage from './ui/gaming-login';

interface MatrixGamingLoginProps {
  onLogin: (username: string) => void;
  onBack?: () => void;
}

const MatrixGamingLogin: React.FC<MatrixGamingLoginProps> = ({ onLogin, onBack }) => {
  const handleLogin = (email: string, password: string, remember: boolean) => {
    console.log('Matrix Gaming Login attempt:', { email, password, remember });
    // Convert to username for consistency with chat system
    onLogin(email);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-12">
      {/* Matrix Background with video */}
      <LoginPage.VideoBackground videoUrl="https://videos.pexels.com/video-files/8128311/8128311-uhd_2560_1440_25fps.mp4" />

      {/* Back button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onBack}
          className="absolute top-6 left-6 z-30 px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-black/50 transition-all"
        >
          ← Back to Matrix
        </motion.button>
      )}

      {/* Main Gaming Login */}
      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <LoginPage.LoginForm onSubmit={handleLogin} />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
        © 2025 Matrix Gaming UI - Reality is what you make it
      </footer>
    </div>
  );
};

export default MatrixGamingLogin;
