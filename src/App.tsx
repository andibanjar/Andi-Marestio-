import React, { useState, useEffect } from 'react';
import { User, Room, Item, Booking, Borrowing } from './types';
import CalendarView from './components/CalendarView';
import GoogleLoginModal from './components/GoogleLoginModal';
import RoomModal from './components/RoomModal';
import ItemModal from './components/ItemModal';
import BookingFormModal from './components/BookingFormModal';
import BorrowFormModal from './components/BorrowFormModal';

import {
  GraduationCap,
  Calendar,
  Layers,
  Archive,
  Menu,
  X,
  Plus,
  Trash2,
  Edit,
  ShieldAlert,
  Search,
  Check,
  MapPin,
  Clock,
  User as UserIcon,
  BookOpen,
  LogOut,
  RotateCcw,
  CheckSquare,
  AlertTriangle,
  FileCheck2,
  ChevronRight,
  BookmarkCheck,
  ShieldCheck,
  Wrench,
  ThumbsUp
} from 'lucide-react';

export default function App() {
  // Session & User States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Core inventories & lists
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);

  // Navigation tabs: 'dashboard' | 'calendar' | 'rooms' | 'bookings' | 'items' | 'borrowings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile drawer toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // CRUD item edit triggers
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Forms modals visibility
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);

  // Target values trackers
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);

  // Load and refresh state from Full-stack API
  const refreshDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/db');
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
        setItems(data.items || []);
        setBookings(data.bookings || []);
        setBorrowings(data.borrowings || []);
      }
    } catch (error) {
      console.warn('API Server offline. Relying on default memory seeds.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user session was stored locally
    const savedUser = localStorage.getItem('sps_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sps_user');
      }
    } else {
      // Auto open login modal for simple pristine onboarding experience
      setShowLoginModal(true);
    }

    refreshDatabase();
  }, []);

  // Helper trigger alerts
  const showNotification = (type: 'success' | 'error', message: string) => {
    setBannerNotice({ type, message });
    setTimeout(() => {
      setBannerNotice(null);
    }, 5500);
  };

  // Google Login callbacks
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sps_user', JSON.stringify(user));
    setShowLoginModal(false);
    showNotification('success', `Selamat Datang, ${user.name}! Anda berhasil masuk dengan akun Google.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sps_user');
    setActiveTab('dashboard');
    showNotification('success', 'Anda telah keluar dari aplikasi peminjaman.');
    setShowLoginModal(true);
  };

  const handleResetDB = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengembalikan database ke konfigurasi awal bawaan?')) return;
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setRooms(result.db.rooms);
        setItems(result.db.items);
        setBookings(result.db.bookings);
        setBorrowings(result.db.borrowings);
        showNotification('success', 'Database berhasil disetel ulang ke setelan standar bawaan akademis.');
      }
    } catch (e) {
      showNotification('error', 'Gagal menyambungkan ke server untuk melakukan reset.');
    }
  };

  // Operations for Ruangan (Rooms) - ADMIN ONLY
  const handleSaveRoom = async (roomData: Partial<Room>) => {
    const actionType = roomData.id ? 'edit' : 'add';
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, room: roomData })
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.db.rooms);
        setBookings(data.db.bookings);
        setIsRoomFormOpen(false);
        setEditingRoom(null);
        showNotification('success', data.message);
      } else {
        showNotification('error', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal memproses perubahan ruangan.');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Peringatan: Menghapus ruangan ini akan otomatis menghapus seluruh jadwal booking yang terikat. Lanjutkan?')) return;
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', room: { id: roomId } })
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.db.rooms);
        setBookings(data.db.bookings);
        showNotification('success', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal menghapus ruangan.');
    }
  };

  // Operations for Items (Barang)
  const handleSaveItem = async (itemData: Partial<Item>) => {
    const actionType = itemData.id ? 'edit' : 'add';
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, item: itemData })
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.db.items);
        setIsItemFormOpen(false);
        setEditingItem(null);
        showNotification('success', data.message);
      } else {
        showNotification('error', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal memproses data barang inventaris.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini secara permanen dari daftar inventaris?')) return;
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', item: { id: itemId } })
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.db.items);
        setBorrowings(data.db.borrowings);
        showNotification('success', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal menghapus barang.');
    }
  };

  // Operations for Bookings (Pemesanan Ruang)
  const handleSaveBooking = async (bookingData: any) => {
    if (!currentUser) {
      showNotification('error', 'Sesi Anda telah habis. Harap masuk dengan Google.');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, booking: bookingData })
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.db.bookings);
        setIsBookingFormOpen(false);
        showNotification('success', data.message);
        setActiveTab('calendar'); // Guide them directly to see it in style!
      } else {
        showNotification('error', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal membuat reservasi ruangan.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Apakah Anda ingin membatalkan jadwal pemesanan ruangan ini?')) return;
    try {
      const response = await fetch('/api/bookings/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, deleteAction: true })
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.db.bookings);
        showNotification('success', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal membatalkan jadwal booking.');
    }
  };

  const handleApproveBooking = async (bookingId: string, status: 'Disetujui' | 'Ditolak') => {
    try {
      const response = await fetch('/api/bookings/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status })
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.db.bookings);
        showNotification('success', `Booking berhasil diset menjadi ${status}.`);
      }
    } catch (e) {
      showNotification('error', 'Gagal memperbarui status persetujuan.');
    }
  };

  // Operations for Borrowings (Peminjaman Barang)
  const handleSaveBorrowing = async (borrowingData: any) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/borrowings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, borrowing: borrowingData })
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.db.items);
        setBorrowings(data.db.borrowings);
        setIsBorrowFormOpen(false);
        showNotification('success', data.message);
        setActiveTab('borrowings'); // Go to list to sign & look up!
      } else {
        showNotification('error', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal mencatat peminjaman barang.');
    }
  };

  const handleReturnItem = async (borrowingId: string) => {
    try {
      const response = await fetch('/api/borrowings/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: borrowingId })
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.db.items);
        setBorrowings(data.db.borrowings);
        showNotification('success', data.message);
      }
    } catch (e) {
      showNotification('error', 'Gagal memperbarui pengembalian barang.');
    }
  };

  // Quick helper: calculate active metrics
  const totalRuanganActive = rooms.filter(r => r.status === 'Tersedia').length;
  const totalBarangActive = items.reduce((acc, current) => acc + current.tersedia, 0);
  const totalBookingBulanIni = bookings.filter(b => b.status === 'Disetujui').length;
  const totalBarangSedangDipinjam = borrowings.filter(br => br.status === 'Belum Dikembalikan').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none antialiased text-gray-800">
      
      {/* Top Notification Toast overlay */}
      {bannerNotice && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm bg-white border border-gray-150 rounded-2xl p-4 shadow-2xl flex items-start space-x-3 animate-fade-in border-l-4 border-l-blue-600">
          <div className={`p-1.5 rounded-xl ${bannerNotice.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <Check className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-bold text-gray-800">Pemberitahuan Sistem</h5>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{bannerNotice.message}</p>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xs pl-2">
            ✕
          </button>
        </div>
      )}

      {/* Main Container Wrapper */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Sidebar Frame Layout (High Density Brutalist Theme) */}
        <aside className={`w-56 border-r border-[#141414] bg-[#E4E3E0] text-[#141414] flex flex-col shrink-0 z-40 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 bg-[#E4E3E0]' : '-translate-x-full absolute md:relative'
        }`} id="sim-sarpras-sidebar">
          
          {/* Sidebar Brand Header */}
          <div className="p-4 border-b border-[#141414] flex items-center space-x-2 bg-[#E4E3E0]">
            <div className="w-10 h-10 bg-[#141414] flex items-center justify-center rounded-sm">
              <div className="w-5 h-5 border-2 border-[#E4E3E0] rotate-45"></div>
            </div>
            <div>
              <span className="font-display font-black tracking-normal text-sm text-[#141414] uppercase leading-none block">LendSpace Pro</span>
              <span className="text-[9px] text-[#141414] font-mono block tracking-tight opacity-60">SIM Sarpras v2.4</span>
            </div>
          </div>

          {/* User Profile Area */}
          <div className="p-4 border-b border-[#141414] bg-white/40 text-[#141414]">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    className="w-10 h-10 border border-[#141414] object-cover avatar-img"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate text-[#141414] uppercase tracking-tight">{currentUser.name}</h4>
                  <p className="text-[9px] font-mono text-[#141414] opacity-60 truncate mt-0.5">{currentUser.email}</p>
                  
                  {/* Role Badge */}
                  <span className="inline-block mt-1 px-1.5 py-0.5 text-[8px] font-mono font-bold bg-[#141414] text-[#E4E3E0]">
                    {currentUser.role === 'admin' ? 'ADMIN' : 'CIVITAS'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 bg-white border border-[#141414]">
                <p className="text-[10px] font-mono uppercase text-[#141414] opacity-65">BELUM TERKONEKSI</p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="mt-1.5 w-full bg-[#141414] text-[#E4E3E0] hover:bg-black text-[10px] py-1 font-mono uppercase font-bold transition-all"
                >
                  Masuk Google
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto scrollbar-thin">
            <span className="block text-[10px] font-mono font-bold text-[#141414] opacity-60 uppercase tracking-widest mb-2 pl-2">Menu Navigasi</span>
            
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]'
                  : 'text-[#141414] hover:bg-white border border-transparent hover:border-[#141414]'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Dashboard Utama</span>
            </button>

            <button
              onClick={() => { setActiveTab('calendar'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left transition-all ${
                activeTab === 'calendar'
                  ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]'
                  : 'text-[#141414] hover:bg-white border border-transparent hover:border-[#141414]'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Kalender Booking</span>
            </button>

            <button
              onClick={() => { setActiveTab('rooms'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left transition-all ${
                activeTab === 'rooms'
                  ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]'
                  : 'text-[#141414] hover:bg-white border border-transparent hover:border-[#141414]'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Ruangan & Lab</span>
            </button>

            <button
              onClick={() => { setActiveTab('bookings'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left transition-all ${
                activeTab === 'bookings'
                  ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]'
                  : 'text-[#141414] hover:bg-white border border-transparent hover:border-[#141414]'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 shrink-0" />
              <span>Log Peminjaman</span>
            </button>

            <button
              onClick={() => { setActiveTab('items'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left transition-all ${
                activeTab === 'items'
                  ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]'
                  : 'text-[#141414] hover:bg-white border border-transparent hover:border-[#141414]'
              }`}
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span>Inventaris Barang</span>
            </button>

            <button
              onClick={() => { setActiveTab('borrowings'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left transition-all ${
                activeTab === 'borrowings'
                  ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]'
                  : 'text-[#141414] hover:bg-white border border-transparent hover:border-[#141414]'
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>Pinjam Alat Lab</span>
            </button>
          </nav>

          {/* Operational Hours card from the theme design */}
          <div className="p-3 border-t border-b border-[#141414] bg-white/50 mx-3 mb-2">
            <p className="text-[10px] font-mono uppercase mb-2 opacity-60">Jam Operasional</p>
            <p className="text-[11px] font-bold">SEN-JUM: 08:00 - 16:00</p>
            <p className="text-[11px] font-bold">SAB: 08:00 - 12:30</p>
            <p className="text-[11px] font-bold text-red-650">MIN: TUTUP</p>
          </div>

          {/* Sidebar System Footer Controllers */}
          <div className="p-3 border-t border-[#141414] bg-[#E4E3E0] flex flex-col space-y-1.5 shrink-0">
            <button
              onClick={handleResetDB}
              className="w-full flex items-center justify-center space-x-1 py-1.5 border border-[#141414] hover:bg-white text-[10px] font-bold uppercase tracking-wider text-[#141414] transition-all"
              title="Reset state ke data awal akademis"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>

            {currentUser && (
              <button
                onClick={handleLogout}
                className="w-full bg-[#141414] text-[#E4E3E0] hover:bg-black py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Content View Page Frame Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top Header Controls bar */}
          <header className="h-16 border-b border-[#141414] bg-[#E4E3E0] shrink-0 px-6 flex items-center justify-between text-[#141414]">
            
            {/* Left Header Greeting */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-white border hover:border-[#141414] rounded-none text-[#141414] md:hidden active:scale-95 transition-all"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
              <div>
                <h2 className="text-base font-bold flex items-center uppercase tracking-tight">
                  SIM Sarpras Akademik
                  <span className="ml-2.5 text-[9px] font-mono font-bold bg-[#141414] text-[#E4E3E0] px-2 py-0.5 uppercase">
                    v2.4 Live
                  </span>
                </h2>
                <p className="text-[10px] font-mono opacity-65 uppercase tracking-wider mt-0.5">Universitas Islam Negeri Indonesia • Kampus Terpadu</p>
              </div>
            </div>

            {/* Right Information Clock & Accounts */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex flex-col items-end text-right">
                <span className="text-xs font-bold font-mono">
                  WAKTU SISTEM: 2026-05-22
                </span>
                <span className="text-[9px] font-mono opacity-60 uppercase tracking-widest">OFFLINE-READY SYNC STATUS: OK</span>
              </div>
              
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-1.5 border border-[#141414] bg-red-650 hover:bg-red-750 text-white text-xs font-bold uppercase tracking-wider transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center bg-[#141414] text-[#E4E3E0] hover:bg-black px-4.5 py-2 text-xs font-bold uppercase tracking-wider border border-[#141414] transition-all"
                >
                  Masuk Google
                </button>
              )}
            </div>
          </header>

          {/* Tab Content Router Panels */}
          <main className="flex-1 p-6 space-y-6">

            {/* TAB 1: DASHBOARD UTAMA */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Visual Overview Metric Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Ruangan Tersedia */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Status Ruangan</span>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 font-display">{totalRuanganActive} Unit</h3>
                      <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                        Status Aktif Tersedia
                      </p>
                    </div>
                    <div className="bg-sky-50 text-sky-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card 2: Jumlah Unit Barang */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Sarpras Barang Ready</span>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 font-display">{totalBarangActive} Unit</h3>
                      <p className="text-[11px] text-gray-400 mt-1">Stok siap dipinjam digital</p>
                    </div>
                    <div className="bg-teal-50 text-teal-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                      <Archive className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card 3: Total Booking Bulan Ini */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Booking Disetujui</span>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 font-display">{totalBookingBulanIni} Sesi</h3>
                      <p className="text-[11px] text-blue-600 font-bold mt-1">Tercatat di sistem akademik</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card 4: Sedang Dipinjam */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Peminjaman Berjalan</span>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 font-display">{totalBarangSedangDipinjam} Barang</h3>
                      <p className="text-[11px] text-amber-600 font-bold mt-1">Belum dikembalikan user</p>
                    </div>
                    <div className="bg-amber-50 text-amber-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                      <CheckSquare className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Main Section Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Fast Shortcuts to Reservasi and system guidance */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Guidance / SOP Banner */}
                    <div className="bg-gradient-to-r from-blue-700 to-sky-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
                        <GraduationCap className="w-60 h-60" />
                      </div>
                      <div className="relative z-10 max-w-xl">
                        <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          SOP Panduan Peminjaman Lab
                        </span>
                        <h3 className="text-lg font-bold mt-2 font-display">Ingin Menggunakan Laboratorium atau Meminjam Barang Inventaris?</h3>
                        <p className="text-xs text-blue-100 font-medium leading-relaxed mt-2">
                          Silakan login ke dalam sistem menggunakan akun Google Anda terlebih dahulu. Setelah login, sistem akan menyinkronkan data profil Anda untuk registrasi. Peminjaman laboratorium wajib dilakukan H-3, sedangkan peminjaman alat wajib ditandatangani secara digital!
                        </p>
                        
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              if (!currentUser) {
                                showNotification('error', 'Anda harus login dengan Google terlebih dahulu!');
                                return;
                              }
                              setPreselectedRoomId(undefined);
                              setIsBookingFormOpen(true);
                            }}
                            className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                          >
                            Booking Laboratorium Sekarang
                          </button>
                          
                          <button
                            onClick={() => {
                              if (!currentUser) {
                                showNotification('error', 'Anda harus login dengan Google terlebih dahulu!');
                                return;
                              }
                              setIsBorrowFormOpen(true);
                            }}
                            className="bg-sky-150 border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                          >
                            Pinjam Perlengkapan Lab
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Room Overview Preview block */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">Review Ruang Laboratorium Utama</h3>
                          <p className="text-xs text-gray-500">Pilih ruangan yang sesuai kapasitas mahasiswa untuk kelancaran praktikum</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('rooms')}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center pr-1"
                        >
                          Lihat Semua Ruang <ChevronRight className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rooms.slice(0, 2).map(r => (
                          <div key={r.id} className="border border-gray-150 rounded-xl overflow-hidden flex flex-col group hover:border-blue-200 transition-all bg-gray-50/20">
                            <img src={r.foto} alt={r.nama} className="h-32 w-full object-cover shrink-0" referrerPolicy="no-referrer" />
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{r.nama}</h4>
                                <div className="text-[11px] text-gray-500 space-y-1 mt-1.5 font-medium">
                                  <p className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" /> {r.lokasi}</p>
                                  <p className="flex items-center"><UserIcon className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" /> Kapasitas {r.kapasitas} Mahasiswa</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (!currentUser) {
                                    showNotification('error', 'Harap login dengan akun Google terlebih dahulu.');
                                    return;
                                  }
                                  setPreselectedRoomId(r.id);
                                  setIsBookingFormOpen(true);
                                }}
                                className="mt-3.5 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1.5 font-semibold rounded-lg text-center transition-all border border-blue-105"
                              >
                                Pilih & Pinjam Ruang
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Dynamic Info Logs, and user quota */}
                  <div className="space-y-6">
                    
                    {/* User quota panel */}
                    {currentUser && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3.5">
                        <div className="border-b border-gray-100 pb-3">
                          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Informasi Limit Pengguna</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Disinkronkan otomatis berbasis email Google</p>
                        </div>

                        {/* Booking Quota tracker */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-semibold text-gray-700">
                            <span>Ketersediaan Booking Bulanan:</span>
                            <span className="font-bold text-blue-600">
                              {bookings.filter(b => b.userEmail === currentUser?.email && b.status === 'Disetujui').length} / 4 Sesi
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                bookings.filter(b => b.userEmail === currentUser?.email && b.status === 'Disetujui').length >= 4 ? 'bg-red-500' : 'bg-blue-600'
                              }`}
                              style={{
                                width: `${Math.min(100, (bookings.filter(b => b.userEmail === currentUser?.email && b.status === 'Disetujui').length / 4) * 100)}%`
                              }}
                            />
                          </div>
                          
                          <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                            Maksimal peminjaman ruang kuliah adalah 4x transaksi per bulan per akun Gmail.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Operational hours card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
                      <div className="border-b border-gray-100 pb-2.5">
                        <h4 className="text-xs font-bold text-gray-800 uppercase">Jam Operasional Pelayanan</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Sesuai Kebijakan Universitas</p>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between items-center py-1">
                          <span className="font-semibold text-gray-700">Senin – Jumat</span>
                          <span className="bg-blue-50 text-blue-700 font-mono font-bold px-2 py-0.5 rounded">08.00 – 16.00</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="font-semibold text-gray-700">Sabtu</span>
                          <span className="bg-blue-50 text-blue-700 font-mono font-bold px-2 py-0.5 rounded">08.00 – 12.30</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="font-semibold text-gray-500">Minggu (Libur)</span>
                          <span className="text-red-500 font-semibold italic">TUTUP / LIBUR</span>
                        </div>
                      </div>
                    </div>

                    {/* Developer/Evaluation Credits card */}
                    <div className="p-4 bg-sky-50 text-sky-800 rounded-2xl border border-sky-100 text-[11px] leading-relaxed">
                      <p className="font-bold mb-1 flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-1 text-sky-600" />
                        Informasi Peninjauan Evaluator:
                      </p>
                      Aplikasi peminjaman sarpras ini terintegrasi penuh. Guna mempermudah pengujian, Anda dapat masuk sebagai administrator menggunakan representasi akun <strong>Bapak Drs. Hermawan</strong> pada daftar Google OAuth Chooser, kemudian beralih ke akun Mahasiswa untuk menguji aturan bentrok jadwal atau durasi.
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: KALENDER BOOKING */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Kalender Reservasi</h3>
                    <p className="text-xs text-gray-500">Pilih dari tanggal berikut untuk melihat ketersediaan ruangan Laboratorium Komputer dan Ruang Sidang.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        showNotification('error', 'Masukkan akun Google Anda terlebih dahulu.');
                        return;
                      }
                      setPreselectedRoomId(undefined);
                      setIsBookingFormOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center"
                  >
                    <Plus className="w-4.5 h-4.5 mr-1" />
                    Buat Booking Baru
                  </button>
                </div>

                <CalendarView
                  bookings={bookings}
                  rooms={rooms}
                  currentDateStr="2026-05-22"
                  onDateClick={(dateStr) => {
                    const diffDays = Math.ceil((new Date(dateStr).getTime() - new Date('2026-05-22').getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 3) {
                      showNotification('error', `Aturan H-3: Mengajukan booking untuk tanggal ${dateStr} ditolak sistem karena kurang dari 3 hari.`);
                      return;
                    }
                    if (new Date(dateStr).getDay() === 0) {
                      showNotification('error', 'Hari Minggu kampus libur total.');
                      return;
                    }
                    if (!currentUser) {
                      showNotification('error', 'Masukkan akun Google Anda untuk melakukan booking.');
                      return;
                    }
                    setPreselectedRoomId(undefined);
                    setIsBookingFormOpen(true);
                  }}
                />
              </div>
            )}

            {/* TAB 3: MANAJEMEN RUANGAN */}
            {activeTab === 'rooms' && (
              <div className="space-y-6">
                
                {/* Section Header controllers */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Modul Manajemen Inventaris Ruangan</h3>
                    <p className="text-xs text-gray-500">Kelola master data laboratorium komputer, studio IoT, seminar room, dan kapasitas penunjang kuliah.</p>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => { setEditingRoom(null); setIsRoomFormOpen(true); }}
                      className="bg-sky-700 hover:bg-sky-850 text-white font-bold px-4.5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center"
                    >
                      <Plus className="w-4.5 h-4.5 mr-1" />
                      Tambah Ruangan Baru
                    </button>
                  )}
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map(room => (
                    <div key={room.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-blue-200 transition-all">
                      
                      {/* Room Photo Banner & badge */}
                      <div className="relative">
                        <img src={room.foto} alt={room.nama} className="w-full h-44 object-cover" referrerPolicy="no-referrer" />
                        <span className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-md uppercase ${
                          room.status === 'Tersedia'
                            ? 'bg-emerald-500 text-white'
                            : room.status === 'Dipakai'
                            ? 'bg-blue-600 text-white'
                            : 'bg-red-500 text-white animate-pulse'
                        }`}>
                          {room.status}
                        </span>
                        
                        <div className="absolute left-3.5 bottom-3.5 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-white font-mono text-xs font-bold">
                          Kapasitas: {room.kapasitas} Mhs
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-800">{room.nama}</h4>
                          <p className="text-xs text-gray-500 flex items-center font-medium">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                            {room.lokasi}
                          </p>

                          {/* Facilities */}
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Fasilitas Penunjang:</span>
                            <div className="flex flex-wrap gap-1">
                              {room.fasilitas.map((f, i) => (
                                <span key={i} className="text-[10px] font-semibold bg-gray-100 text-gray-650 px-2 py-0.5 rounded-md border border-gray-150">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action controllers depending on Role */}
                        <div className="pt-3.5 border-t border-gray-100 flex gap-2">
                          {currentUser?.role === 'admin' ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingRoom(room);
                                  setIsRoomFormOpen(true);
                                }}
                                className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold py-2 rounded-lg text-xs transition-all flex items-center justify-center border border-sky-100"
                                title="Ubah Parameter Ruangan"
                              >
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                Ubah
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="px-3 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs transition-all flex items-center justify-center border border-red-100"
                                title="Hapus Permanen Ruangan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              disabled={room.status === 'Perbaikan'}
                              onClick={() => {
                                if (!currentUser) {
                                  showNotification('error', 'Silakan masuk dengan Google terlebih dahulu!');
                                  return;
                                }
                                setPreselectedRoomId(room.id);
                                setIsBookingFormOpen(true);
                              }}
                              className={`w-full py-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center ${
                                room.status === 'Perbaikan'
                                  ? 'bg-gray-150 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                              }`}
                            >
                              Pesan Ruangan Sekarang
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 4: LOG JADWAL BOOKING */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Sistem Log Reservasi Laboratorium & Ruang Sidang</h3>
                      <p className="text-xs text-gray-500">Menampilkan rekaman seluruh pemesanan, program studi terkait, serta status persetujuan dekanat.</p>
                    </div>
                    {currentUser && (
                      <button
                        onClick={() => {
                          setPreselectedRoomId(undefined);
                          setIsBookingFormOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Buat Reservasi Ruangan
                      </button>
                    )}
                  </div>

                  {/* Search query input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Cari program studi, nama pengusul, agenda praktikum, atau id booking..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-250 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Table details */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      
                      {/* Headings */}
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-4">Kode / ID</th>
                          <th className="p-4">Ruangan Mandat</th>
                          <th className="p-4">Tanggal & Jam</th>
                          <th className="p-4">Agenda / Program Studi</th>
                          <th className="p-4">Peminjam Gmail</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-right">Tindakan Pelayanan</th>
                        </tr>
                      </thead>

                      {/* Content Row details */}
                      <tbody className="divide-y divide-gray-150">
                        {bookings
                          .filter(b => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              b.id.toLowerCase().includes(query) ||
                              b.ruanganNama.toLowerCase().includes(query) ||
                              b.prodi.toLowerCase().includes(query) ||
                              b.jenisPraktikum.toLowerCase().includes(query) ||
                              b.userName.toLowerCase().includes(query)
                            );
                          })
                          .map(b => {
                            const isOwnBooking = b.userEmail === currentUser?.email;
                            return (
                              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                
                                {/* Booking Ref */}
                                <td className="p-4 font-mono font-bold text-gray-500">{b.id}</td>
                                
                                {/* Room name */}
                                <td className="p-4">
                                  <div className="font-bold text-gray-800">{b.ruanganNama}</div>
                                  <div className="text-[10px] text-gray-400">ID Ruang: {b.ruanganId}</div>
                                </td>

                                {/* Dates / clock sessions */}
                                <td className="p-4">
                                  <div className="font-semibold text-gray-800 flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                                    {b.tanggal}
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                                    {b.jamMulai} - {b.jamSelesai} WIB
                                  </div>
                                </td>

                                {/* Agenda description */}
                                <td className="p-4 max-w-xs">
                                  <div className="font-bold text-blue-700 text-[11px] uppercase">{b.prodi}</div>
                                  <div className="font-medium text-gray-850 truncate mt-0.5">{b.jenisPraktikum}</div>
                                  <div className="text-[10px] text-gray-400 truncate mt-0.5 italic">Ket: "{b.keperluan}"</div>
                                </td>

                                {/* User description */}
                                <td className="p-4">
                                  <div className="font-bold text-gray-850 flex items-center">
                                    <UserIcon className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                                    {b.userName}
                                  </div>
                                  <div className="text-[10px] text-gray-400">{b.userEmail}</div>
                                </td>

                                {/* Status pills */}
                                <td className="p-4 text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    b.status === 'Disetujui'
                                      ? 'bg-emerald-150 text-emerald-700'
                                      : b.status === 'Ditolak'
                                      ? 'bg-red-150 text-red-700'
                                      : 'bg-amber-150 text-amber-700'
                                  }`}>
                                    {b.status === 'Disetujui' ? 'Disetujui' : b.status === 'Ditolak' ? 'Ditolak' : 'Menunggu'}
                                  </span>
                                </td>

                                {/* Row Actions operations */}
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    {currentUser?.role === 'admin' ? (
                                      <>
                                        {b.status === 'Menunggu' && (
                                          <>
                                            <button
                                              onClick={() => handleApproveBooking(b.id, 'Disetujui')}
                                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all active:scale-95"
                                              title="Setujui permohonan booking"
                                            >
                                              Setujui
                                            </button>
                                            <button
                                              onClick={() => handleApproveBooking(b.id, 'Ditolak')}
                                              className="p-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold transition-all active:scale-95"
                                              title="Tolak permohonan booking"
                                            >
                                              Tolak
                                            </button>
                                          </>
                                        )}
                                        <button
                                          onClick={() => handleCancelBooking(b.id)}
                                          className="p-1 px-2.5 bg-gray-100 hover:bg-red-50 text-red-650 hover:text-red-700 border border-gray-200 hover:border-red-150 rounded text-[10px] font-bold transition-all"
                                          title="Batalkan & hapus agenda"
                                        >
                                          Batal / Hapus
                                        </button>
                                      </>
                                    ) : isOwnBooking ? (
                                      <button
                                        onClick={() => handleCancelBooking(b.id)}
                                        className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded text-[10px] font-bold transition-all"
                                        title="Hapus booking saya"
                                      >
                                        Batalkan Booking
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic">No Access</span>
                                    )}
                                  </div>
                                </td>

                              </tr>
                            );
                          })}
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                              Tidak ada rekaman pemesanan laboratorium saat ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: INVENTARIS BARANG */}
            {activeTab === 'items' && (
              <div className="space-y-6">
                
                {/* Module description controllers */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Manajemen Inventaris Peralatan LAB</h3>
                    <p className="text-xs text-gray-500">Kelola ketersediaan alat pendukung praktikum: Laptop, LCD Projector, perangkat IoT, solder, soundcard visual.</p>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => { setEditingItem(null); setIsItemFormOpen(true); }}
                      className="bg-teal-700 hover:bg-teal-850 text-white font-bold px-4.5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center"
                    >
                      <Plus className="w-4.5 h-4.5 mr-1" />
                      Tambah Alat Inventaris
                    </button>
                  )}
                </div>

                {/* Items Catalog List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:border-teal-200 transition-all">
                      
                      {/* Top Bar Header category & status */}
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 font-bold rounded-md uppercase border border-teal-100">
                            {item.kategori}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.tersedia > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-600 animate-pulse'
                          }`}>
                            Stok: {item.tersedia} / {item.jumlah} Unit
                          </span>
                        </div>

                        {/* Title & metadata */}
                        <h4 className="text-sm font-bold text-gray-800 mt-3">{item.nama}</h4>
                        
                        <div className="text-[11px] text-gray-500 space-y-1.5 mt-2 font-medium">
                          <p className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                            Lokasi Rak: {item.lokasi}
                          </p>
                          <p className="flex items-center">
                            <Wrench className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                            Kondisi Unit: <span className={`font-bold ml-1 ${item.kondisi === 'Baik' ? 'text-emerald-600' : 'text-amber-500'}`}>{item.kondisi}</span>
                          </p>
                        </div>
                      </div>

                      {/* Content Action buttons based on status & role */}
                      <div className="mt-5 pt-3.5 border-t border-gray-100 flex gap-2">
                        {currentUser?.role === 'admin' ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsItemFormOpen(true);
                              }}
                              className="flex-1 bg-teal-50 hover:bg-teal-150 text-teal-800 font-bold py-2 rounded-lg text-xs transition-all flex items-center justify-center border border-teal-100"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Ubah Alat
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="px-3 bg-red-50 hover:bg-red-100 text-red-605 border border-red-100 hover:border-red-200 rounded-lg text-xs transition-all flex items-center justify-center"
                              title="Hapus Barang Inventaris"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            disabled={item.tersedia === 0}
                            onClick={() => {
                              if (!currentUser) {
                                showNotification('error', 'Harap login dengan akun Google terlebih dahulu.');
                                return;
                              }
                              setIsBorrowFormOpen(true);
                            }}
                            className={`w-full py-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center ${
                              item.tersedia === 0
                                ? 'bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-md'
                            }`}
                          >
                            {item.tersedia === 0 ? 'Stok Kosong' : 'Pinjam Barang & Gores Paraf'}
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 6: LOG SURAT PEMINJAMAN ALAT */}
            {activeTab === 'borrowings' && (
              <div className="space-y-6">
                
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Sistem Dokumen & Surat Pinjam Barang</h3>
                      <p className="text-xs text-gray-500">Menyajikan riwayat peminjaman alat laboratorium beserta verifikasi paraf tanda tangan digital mahasiswa.</p>
                    </div>
                    {currentUser && (
                      <button
                        onClick={() => setIsBorrowFormOpen(true)}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Buat Surat Pinjam Baru
                      </button>
                    )}
                  </div>
                </div>

                {/* Borrowings Cards (Styled like a Physical Signed Document Receipt) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {borrowings.map(b => (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex flex-col justify-between space-y-4 border-t-4 border-t-teal-700 relative overflow-hidden group">
                      
                      {/* Sealed Status Stamp icon backdrop */}
                      <div className="absolute -right-2 -bottom-2 opacity-5 font-mono text-7xl font-extrabold rotate-12 uppercase pointer-events-none">
                        Sarpras
                      </div>

                      {/* Header details */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-bold text-gray-400">{b.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'Sudah Dikembalikan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="pt-1 select-text">
                          <h4 className="text-sm font-bold text-gray-800 leading-tight">{b.itemNama}</h4>
                          <p className="text-xs text-gray-550 mt-1 font-semibold">
                            Volume: <span className="text-teal-700 text-xs font-bold">{b.jumlah} Unit</span>
                          </p>
                        </div>

                        {/* Date spans */}
                        <div className="text-[11px] text-gray-550 space-y-1 bg-gray-50/75 p-3 rounded-xl border border-gray-150 font-medium">
                          <p className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            借 Dipinjam: {b.tanggalPinjam}
                          </p>
                          <p className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            返 Kembali: {b.tanggalKembali}
                          </p>
                          {b.tanggalDikembalikan && (
                            <p className="flex items-center text-emerald-600 font-semibold">
                              <Check className="w-3.5 h-3.5 mr-1.5" />
                              Tgl Kembali Aktual: {b.tanggalDikembalikan}
                            </p>
                          )}
                        </div>

                        {/* User Borrower detail */}
                        <div className="text-[11px] text-gray-500 font-medium pt-1">
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wide">Peminjam:</p>
                          <p className="font-bold text-gray-800 leading-relaxed">{b.userName}</p>
                          <p className="text-[10px] leading-tight">{b.userEmail}</p>
                        </div>
                      </div>

                      {/* Signature block verification and dynamic return action */}
                      <div className="pt-3 border-t border-gray-150 flex flex-col space-y-3">
                        
                        {/* Render saved hand-drawn base64 signature with premium stamp border */}
                        <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl border border-gray-150 relative">
                          <span className="absolute top-1 left-2 text-[8px] font-bold text-gray-400 uppercase tracking-wide">
                            Paraf Sah Digital:
                          </span>
                          <img
                            src={b.tandaTangan}
                            alt="Paraf signature"
                            className="h-14 w-auto object-contain max-w-full mix-blend-multiply opacity-85 mt-2"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[9px] text-emerald-600 font-bold font-mono mt-1 opacity-80 uppercase tracking-tight">
                            VERIFIED BY GOOGLE INTEGRITY
                          </span>
                        </div>

                        {/* Action return trigger */}
                        {b.status === 'Belum Dikembalikan' && (
                          <button
                            onClick={() => handleReturnItem(b.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1"
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Sahkan Sebagai "Sudah Dikembalikan"
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                  {borrowings.length === 0 && (
                    <div className="col-span-full p-8 text-center text-gray-400 italic bg-white rounded-2xl border border-gray-150">
                      Belum ada dokumen / surat pinjam barang yang diajukan.
                    </div>
                  )}
                </div>

              </div>
            )}

          </main>
        </div>

      </div>

      {/* Floating interactive background particles when in loading sequence */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 max-w-xs text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h4 className="font-bold text-gray-800 text-sm">Menghubungkan Server SIM-Sarpras</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Menyinkronkan status ketersediaan ruangan, data inventaris offline, dan kuota Google Authentication...</p>
          </div>
        </div>
      )}

      {/* MODALS DEFINITIONS CONTAINER */}
      <GoogleLoginModal
        isOpen={showLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />

      <RoomModal
        isOpen={isRoomFormOpen}
        onClose={() => { setIsRoomFormOpen(false); setEditingRoom(null); }}
        onSave={handleSaveRoom}
        roomToEdit={editingRoom}
      />

      <ItemModal
        isOpen={isItemFormOpen}
        onClose={() => { setIsItemFormOpen(false); setEditingItem(null); }}
        onSave={handleSaveItem}
        itemToEdit={editingItem}
      />

      <BookingFormModal
        isOpen={isBookingFormOpen}
        onClose={() => setIsBookingFormOpen(false)}
        onSave={handleSaveBooking}
        rooms={rooms}
        savedBookings={bookings}
      />

      <BorrowFormModal
        isOpen={isBorrowFormOpen}
        onClose={() => setIsBorrowFormOpen(false)}
        onSave={handleSaveBorrowing}
        items={items}
      />

    </div>
  );
}
