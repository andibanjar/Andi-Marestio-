import React, { useState } from 'react';
import { Booking, Room } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon, GraduationCap, Info } from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  rooms: Room[];
  currentDateStr: string; // "2026-05-22"
  onDateClick?: (dateStr: string) => void;
}

export default function CalendarView({ bookings, rooms, currentDateStr, onDateClick }: CalendarViewProps) {
  // Let's model current viewing month/year around the current target time (May 2026)
  const [viewDate, setViewDate] = useState<Date>(new Date(currentDateStr));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Calculate grid structures
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Helper to format date strings to match "YYYY-MM-DD"
  const formatDateString = (dYear: number, dMonth: number, dDate: number) => {
    const mm = String(dMonth + 1).padStart(2, '0');
    const dd = String(dDate).padStart(2, '0');
    return `${dYear}-${mm}-${dd}`;
  };

  // Get color styles for a room
  const getRoomBadgeColor = (roomId: string) => {
    switch (roomId) {
      case 'R01': return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
      case 'R02': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'R03': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      case 'R04': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
    }
  };

  // Build grid days
  const calendarCells: React.ReactNode[] = [];

  // Add blank padding days for the previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(
      <div key={`empty-${i}`} className="min-h-[90px] bg-gray-50/50 border border-gray-100 text-gray-300 p-1" />
    );
  }

  // Add the actual current month's days
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedCellDate = formatDateString(year, month, d);
    const isToday = formattedCellDate === currentDateStr;
    const dayOfWeek = new Date(year, month, d).getDay();
    const isSunday = dayOfWeek === 0;

    // Bookings on this day
    const dayBookings = bookings.filter(b => b.tanggal === formattedCellDate && b.status === 'Disetujui');

    calendarCells.push(
      <div
        key={`day-${d}`}
        onClick={() => onDateClick?.(formattedCellDate)}
        className={`min-h-[110px] bg-white border border-[#141414] p-1.5 flex flex-col justify-between transition-all hover:bg-neutral-50 cursor-pointer group ${
          isToday ? 'border-2 border-[#141414] bg-neutral-50 z-10' : ''
        } ${isSunday ? 'bg-red-50/10' : ''}`}
      >
        {/* Header containing Day number */}
        <div className="flex justify-between items-center mb-1">
          <span
            className={`w-6 h-6 flex items-center justify-center text-xs font-mono font-bold ${
              isToday
                ? 'bg-[#141414] text-[#E4E3E0]'
                : isSunday
                ? 'text-red-650'
                : 'text-[#141414] group-hover:underline'
            }`}
          >
            {d}
          </span>
          {isSunday && (
            <span className="text-[9px] font-bold text-red-400 bg-red-50 px-1 py-0.5 rounded">
              LBR
            </span>
          )}
          {dayBookings.length > 0 && !isSunday && (
            <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1 rounded-md">
              {dayBookings.length} Sesi
            </span>
          )}
        </div>

        {/* Content: list of mini booked badges */}
        <div className="flex-1 flex flex-col space-y-1 overflow-y-auto max-h-[75px] scrollbar-thin">
          {dayBookings.map(b => (
            <div
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBooking(b);
              }}
              className={`text-[9px] leading-tight px-1.5 py-1 rounded-md border truncate font-medium flex flex-col transition-all cursor-all-scroll shadow-sm ${getRoomBadgeColor(
                b.ruanganId
              )}`}
              title={`${b.ruanganNama}: ${b.jamMulai}-${b.jamSelesai}`}
            >
              <span className="font-bold">{b.jamMulai} - {b.jamSelesai}</span>
              <span className="opacity-90">{b.ruanganNama.replace('Laboratorium ', 'Lab ').replace('Studio ', 'Std ')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Remaining cells to make grid multiple of 7
  const totalCells = calendarCells.length;
  const rem = totalCells % 7;
  if (rem > 0) {
    for (let j = 0; j < 7 - rem; j++) {
      calendarCells.push(
        <div key={`empty-end-${j}`} className="min-h-[100px] bg-gray-50/50 border border-gray-100 text-gray-300 p-1" />
      );
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Calendar Controller Bar */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Kalender Pemakaian Sarpras</h3>
            <p className="text-xs text-gray-500">Visualisasi realtime jadwal bentrok dan ketersediaan ruang</p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-gray-200 rounded-lg border border-gray-200 transition-all text-gray-600 active:scale-95"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-1 text-sm font-bold text-gray-800 border border-gray-200 bg-white rounded-lg min-w-[120px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-gray-200 rounded-lg border border-gray-200 transition-all text-gray-600 active:scale-95"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewDate(new Date(currentDateStr))}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Week days labels */}
      <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200 text-center">
        {DAYS_OF_WEEK.map((day, ix) => (
          <div
            key={day}
            className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
              ix === 0 ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Main Grid Cellular Container */}
      <div className="grid grid-cols-7 bg-gray-50 gap-[1px]">
        {calendarCells}
      </div>

      {/* Guidelines/Markers */}
      <div className="p-3 bg-gray-50 border-t border-gray-150 flex flex-wrap gap-4 text-xs text-gray-600 justify-center">
        <span className="font-semibold text-[11px] text-gray-400 uppercase tracking-wider mr-2 self-center">Petunjuk Ruang:</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-1.5" />Lab Komputer SIFO</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />Workshop & Seminar</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5" />Studio Jaringan & IoT</span>
        <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />Ruang Sidang Utama</span>
      </div>

      {/* Dynamic Detail Modal overlay if a scheduled badge is clicked */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-100" />
                <h4 className="font-bold">Informasi Detail Booking</h4>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white hover:text-blue-100 text-sm font-bold bg-blue-700 hover:bg-blue-800 w-7 h-7 flex items-center justify-center rounded-full transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                  {selectedBooking.prodi}
                </span>
                <h3 className="text-base font-bold text-gray-800 mt-2">{selectedBooking.jenisPraktikum}</h3>
              </div>

              <div className="space-y-2.5 pt-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span><strong>Lokasi:</strong> {selectedBooking.ruanganNama}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span><strong>Waktu:</strong> {selectedBooking.tanggal} ({selectedBooking.jamMulai} - {selectedBooking.jamSelesai})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate"><strong>Peminjam:</strong> {selectedBooking.userName} ({selectedBooking.userEmail})</span>
                </div>

                <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1">
                  <GraduationCap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs text-gray-500 block">Tujuan & Keperluan:</strong>
                    <p className="text-xs text-gray-750 font-normal leading-relaxed mt-0.5">{selectedBooking.keperluan}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-xs transition-all mt-4"
              >
                Tutup Jendela info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
