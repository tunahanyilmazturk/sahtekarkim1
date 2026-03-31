import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase, supabaseService } from '../lib/supabase';

// Basit şifre hash fonksiyonu (Web Crypto API ile)
// Gerçek üretimde bcrypt-js kullanın
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sahtekar_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AuthProps {
  onLogin: (userId: string, username: string) => void;
  onBack: () => void;
}

export function Auth({ onLogin, onBack }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim()) {
      setError('Kullanıcı adı gereklidir');
      return;
    }

    if (!password.trim()) {
      setError('Şifre gereklidir');
      return;
    }

    if (username.trim().length < 2) {
      setError('Kullanıcı adı en az 2 karakter olmalı');
      return;
    }

    if (password.trim().length < 4) {
      setError('Şifre en az 4 karakter olmalı');
      return;
    }

    setLoading(true);

    try {
      const usernameLower = username.toLowerCase().trim();
      
      // Check if user exists
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .ilike('username', usernameLower);

      if (fetchError) throw fetchError;

      const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

      // Şifreyi hash'le
      const hashedPassword = await hashPassword(password);

      if (isLogin) {
        if (existingUser) {
          if (existingUser.password === hashedPassword) {
            setSuccessMsg('Giriş başarılı!');
            onLogin(existingUser.id, existingUser.username);
          } else {
            setError('Şifre yanlış');
          }
        } else {
          setError('Kullanıcı bulunamadı');
        }
      } else {
        if (existingUser) {
          setError('Bu kullanıcı adı zaten kullanılıyor');
        } else {
          const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          await supabaseService.createUser(userId, username.trim(), hashedPassword);
          setSuccessMsg('Hesap oluşturuldu! Hoş geldiniz!');
          onLogin(userId, username.trim());
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('Sunucu hatası. Lütfen tekrar dene.');
    }

    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col h-[100dvh] bg-gradient-to-b from-white to-zinc-50"
    >
      <div className="p-4 pt-safe flex items-center border-b border-zinc-100">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-black text-zinc-900 ml-2">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-red-500/30 mb-4">
              <span className="text-4xl">🎭</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900">SAHTEKAR</h1>
            <p className="text-zinc-500">Kim?</p>
          </div>

          <div className="flex bg-zinc-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                isLogin 
                  ? 'bg-white text-zinc-900 shadow-md' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                !isLogin 
                  ? 'bg-white text-zinc-900 shadow-md' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold mb-4 text-center"
            >
              {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold mb-4 text-center"
            >
              {successMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adı"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-zinc-900 focus:bg-white transition-colors font-bold outline-none"
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-zinc-900 focus:bg-white transition-colors font-bold outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/25 disabled:opacity-50"
            >
              {loading ? 'Bekle...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
            </motion.button>
          </form>

          {!isLogin && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-700 text-xs font-bold text-center">
                ⚠️ Bu şifreyi not alın! Tekrar değiştirme olmayacaktır.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
