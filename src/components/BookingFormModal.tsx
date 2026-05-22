import React, { useState, useEffect } from 'react';
import { Room, Booking } from '../types';
import { Calendar, Clock, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: {
    ruanganId: string;
    tanggal: string;
    prodi: string;
    jenisPraktikum: string;
    jamMulai: string;
    jamSelesai: string;
    keperluan: string;
  }) => void;
  rooms: Room[];
  savedBookings: Booking[];
  preselectedDate?: string;
}

export default function BookingFormModal({ isOpen, onClose, onSave, rooms, savedBookings, preselectedDate }: BookingFormModalProps) {
  const [ruanganId, setRuanganId] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [prodi, setProdi] = useState('Sistem Informasi');
  const [jenisPraktikum, setJenisPraktikum] = useState('');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('11:00');
  const [keperluan, setKeperluan] = useState('');

  // Local warning statuses for fluid form experiences
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (rooms.length > 0 && !ruanganId) {
      // Pick first room as default
      const firstAvail = rooms.find(r => r.status !== 'Perbaikan');
      if (firstAvail) setRuanganId(firstAvail.id);
    }
    if (preselectedDate) {
      setTanggal(preselectedDate);
    } else {
      // Default to next H-3 compliant day: relative to May 22, let's propose May 26
      setTanggal('2026-05-26');
    }
  }, [rooms, preselectedDate, isOpen]);

  // Real-time calculation of inputs
  useEffect(() => {
    if (!tanggal || !jamMulai || !jamSelesai) {
      setWarnings([]);
      return;
    }

    const currentWarnings: string[] = [];

    // Date calculations: System date is fixed to 2026-05-22
    const today = new Date('2026-05-22');
    const targetDate = new Date(tanggal);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      currentWarnings.push('⚠️ Tanggal Pilihan tidak memenuhi aturan H-3 (minimal 3 hari sebelum pemakaian).');
    }

    const dayOfWeek = targetDate.getDay(); // 0 Sunday, 6 Saturday
    if (dayOfWeek === 0) {
      currentWarnings.push('⚠️ Hari Minggu adalah hari libur nasional Kampus. Kampus libur total.');
    }

    // Time calculations
    const parseTimeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const startMin = parseTimeToMinutes(jamMulai);
    const endMin = parseTimeToMinutes(jamSelesai);

    if (startMin >= endMin) {
      currentWarnings.push('⚠️ Jam Selesai harus sesudah Jam Mulai.');
    } else {
      // Check active operational hours
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Mon-Fri 08:00 - 16:00 (480-960 min)
        if (startMin < 480 || endMin > 960) {
          currentWarnings.push('⚠️ Jam Operasional Kerja Senin-Jumat: 08:00 s/d 16:00 WIB.');
        }
      } else if (dayOfWeek === 6) {
        // Sat 08:00 - 12:30 (480-750 min)
        if (startMin < 480 || endMin > 750) {
          currentWarnings.push('⚠️ Jam Operasional Kerja Sabtu: 08:00 s/d 12:30 WIB.');
        }
      }

      // Check max duration 3.5 hours (210 min)
      if (endMin - startMin > 210) {
        currentWarnings.push('⚠️ Durasi penyewaan melebihi kuota maks: Maksimal 3.5 jam (210 menit) sekali booking.');
      }
    }

    // Checking overlap in memory
    const selectedRoom = rooms.find(r => r.id === ruanganId);
    if (selectedRoom) {
      const hasConflict = savedBookings.some(b => {
        if (b.ruanganId === ruanganId && b.tanggal === tanggal && b.status === 'Disetujui') {
          const bStart = parseTimeToMinutes(b.jamMulai);
          const bEnd = parseTimeToMinutes(b.jamSelesai);
          return (startMin < bEnd && endMin > bStart);
        }
        return false;
      });
      if (hasConflict) {
        currentWarnings.push(`⚠️ Terjadi konflik jadwal! Jam yang Anda pilih bentrok dengan pemesanan lain di ruangan ${selectedRoom.nama}.`);
      }
    }

    setWarnings(currentWarnings);
  }, [ruanganId, tanggal, jamMulai, jamSelesai, rooms, savedBookings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruanganId || !tanggal || !jenisPraktikum.trim() || !keperluan.trim()) return;
    
    onSave({
      ruanganId,
      tanggal,
      prodi,
      jenisPraktikum,
      jamMulai,
      jamSelesai,
      keperluan
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-150 flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-4.5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold">Formulir Peminjaman Ruangan</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 font-bold bg-blue-700 hover:bg-blue-850 w-7 h-7 flex items-center justify-center rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Rules Banner (Compact) */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-105 text-[11px] text-blue-800 space-y-1">
            <p className="font-bold flex items-center">
              <HelpCircle className="w-4 h-4 mr-1 text-blue-600 shrink-0" />
              Syarat Utama Reservasi Laboratorium & Ruang Sidang:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-blue-700">
              <li>Pemesanan minimal dilakukan **H-3** dari tanggal pemakaian.</li>
              <li>Jam kerja: **Sen s/d Jum (08:00-16:00)** & **Sab (08:00-12:30)**. Hari Minggu tutup.</li>
              <li>Maksimal durasi satu kali pertemuan: **3,5 jam**. Kuota maksimal **4x sebulan** per user.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ruangan */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pilih Ruangan</label>
              <select
                required
                value={ruanganId}
                onChange={(e) => setRuanganId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id} disabled={room.status === 'Perbaikan'}>
                    {room.nama} ({room.lokasi}) {room.status === 'Perbaikan' ? '- [DITANGGUHKAN / PERBAIKAN]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Booking */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Pemakaian (H-3)</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Program Studi */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Program Studi / Instansi</label>
              <select
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Perbankan Syariah">Perbankan Syariah</option>
                <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
                <option value="Hukum Ekonomi Syariah">Hukum Ekonomi Syariah</option>
                <option value="Pascasarjana">General / Pascasarjana</option>
              </select>
            </div>

            {/* Jam Mulai */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                Jam Mulai Kerja
              </label>
              <input
                type="time"
                required
                step="900" // 15 mins block
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jam Selesai */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                Jam Selesai
              </label>
              <input
                type="time"
                required
                step="900"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jenis Praktikum */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jenis Praktikum / Agenda Kegiatan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Praktikum Algoritma & Pemrograman C++"
                value={jenisPraktikum}
                onChange={(e) => setJenisPraktikum(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Keperluan */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tujuan Detail Keperluan</label>
              <textarea
                required
                rows={3}
                placeholder="Deskripsikan modul yang diajarkan, peserta praktikum, serta sarana penunjang yang diperlukan..."
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Warnings List Experience */}
          {warnings.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5 animate-pulse text-xs text-amber-700">
              {warnings.map((warn, index) => (
                <div key={index} className="flex items-start">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{warn}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons footer */}
          <div className="flex space-x-2 pt-4 border-t border-gray-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={warnings.length > 0}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md transition-all active:scale-95 ${
                warnings.length > 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Kirim Registrasi Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
