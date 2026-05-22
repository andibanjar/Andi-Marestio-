import React, { useState } from 'react';
import { User, Role } from '../types';
import { Shield, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface GoogleLoginModalProps {
  onLoginSuccess: (user: User) => void;
  isOpen: boolean;
}

export default function GoogleLoginModal({ onLoginSuccess, isOpen }: GoogleLoginModalProps) {
  const [useCustom, setUseCustom] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<Role>('user');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectSample = (email: string, name: string, role: Role, photo: string) => {
    const finalUser: User = {
      email,
      name,
      photoUrl: photo,
      role
    };
    onLoginSuccess(finalUser);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customEmail.endsWith('@gmail.com') && !customEmail.includes('@')) {
      setErrorMsg('Harap masukkan alamat email Google yang valid.');
      return;
    }
    if (!customName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    const emailPrefix = customEmail.split('@')[0].replace(/[^a-zA-Z]/g, '');
    const finalUser: User = {
      email: customEmail,
      name: customName,
      photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${emailPrefix || 'google'}`,
      role: customRole
    };
    onLoginSuccess(finalUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" id="google-oauth-modal">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col p-6 relative">
        {/* Google Mini Banner */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="flex items-center justify-center space-x-1 mb-3">
            <span className="text-2xl font-bold tracking-tight text-[#4285F4]">G</span>
            <span className="text-2xl font-bold tracking-tight text-[#EA4335]">o</span>
            <span className="text-2xl font-bold tracking-tight text-[#FBBC05]">o</span>
            <span className="text-2xl font-bold tracking-tight text-[#4285F4]">g</span>
            <span className="text-2xl font-bold tracking-tight text-[#34A853]">l</span>
            <span className="text-2xl font-bold tracking-tight text-[#EA4335]">e</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Masuk dengan Google</h2>
          <p className="text-sm text-gray-500 mt-1">Sistem Informasi Peminjaman Sarpras Kampus</p>
        </div>

        {/* Tab Toggle between quick-accounts and custom input */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setUseCustom(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${!useCustom ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Pilih Akun Terdaftar
          </button>
          <button
            type="button"
            onClick={() => setUseCustom(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${useCustom ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Gunakan Akun Lain
          </button>
        </div>

        {!useCustom ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Akun Contoh Simulasi (Cepat):</p>
            
            {/* Account 1: Admin */}
            <button
              onClick={() => handleSelectSample(
                'admin.sarpras@gmail.com',
                'Bapak Drs. Hermawan (Admin)',
                'admin',
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120'
              )}
              className="w-full flex items-center justify-between p-3.5 bg-sky-50/50 hover:bg-sky-50 border border-sky-100 hover:border-sky-300 rounded-xl transition-all text-left duration-200 group"
              id="btn-login-admin"
            >
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120"
                  alt="Admin profile"
                  className="w-10 h-10 rounded-full object-cover border border-sky-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 group-hover:text-sky-700">Bapak Drs. Hermawan</h4>
                  <p className="text-xs text-gray-500">admin.sarpras@gmail.com</p>
                </div>
              </div>
              <span className="flex items-center px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-700 rounded-full">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN
              </span>
            </button>

            {/* Account 2: User */}
            <button
              onClick={() => handleSelectSample(
                'mahasiswa.sifo@gmail.com',
                'Ahmad Rafli Fauzi',
                'user',
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120'
              )}
              className="w-full flex items-center justify-between p-3.5 bg-emerald-50/30 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-300 rounded-xl transition-all text-left duration-200 group"
              id="btn-login-mahasiswa"
            >
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120"
                  alt="Student profile"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700">Ahmad Rafli Fauzi</h4>
                  <p className="text-xs text-gray-500">mahasiswa.sifo@gmail.com</p>
                </div>
              </div>
              <span className="flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                USER/MHS
              </span>
            </button>

            {/* Account 3: Another User for validation demonstrations */}
            <button
              onClick={() => handleSelectSample(
                'dosen.teladani@gmail.com',
                'Dr. Indah Permatasari',
                'user',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120'
              )}
              className="w-full flex items-center justify-between p-3.5 bg-purple-50/30 hover:bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-xl transition-all text-left duration-200 group"
              id="btn-login-dosen"
            >
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120"
                  alt="Dosen profile"
                  className="w-10 h-10 rounded-full object-cover border border-purple-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 group-hover:text-purple-700">Dr. Indah Permatasari</h4>
                  <p className="text-xs text-gray-500">dosen.teladani@gmail.com</p>
                </div>
              </div>
              <span className="flex items-center px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full">
                USER/DOSEN
              </span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center space-x-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Akbar Utama"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Google (@gmail.com)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Pilih Peran (Role Hak Akses)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCustomRole('user')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    customRole === 'user'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-bold">User Umum</span>
                  <span className="text-[10px] text-gray-400">Booking & Pinjam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomRole('admin')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    customRole === 'admin'
                      ? 'bg-sky-50 border-sky-600 text-sky-800 ring-1 ring-sky-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-bold flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1" />
                    Admin
                  </span>
                  <span className="text-[10px] text-gray-400">Akses Penuh Kelola</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Sambungkan Akun</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer info explaining simulated nature */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400 flex flex-col items-center space-y-1">
          <span>Keamanan Terjamin oleh Google OAuth Sandbox</span>
          <span>Aplikasi ini berjalan dalam simulasi otentikasi luring</span>
        </div>
      </div>
    </div>
  );
}
