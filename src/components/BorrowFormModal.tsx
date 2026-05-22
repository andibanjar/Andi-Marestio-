import React, { useState, useEffect } from 'react';
import { Item, Borrowing } from '../types';
import SignaturePad from './SignaturePad';
import { Settings, Check, Calendar, Plus, Archive, ShieldCheck, AlertCircle } from 'lucide-react';

interface BorrowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (borrowing: {
    itemId: string;
    jumlah: number;
    tanggalPinjam: string;
    tanggalKembali: string;
    tandaTangan: string;
  }) => void;
  items: Item[];
}

export default function BorrowFormModal({ isOpen, onClose, onSave, items }: BorrowFormModalProps) {
  const [itemId, setItemId] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [tanggalPinjam, setTanggalPinjam] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');
  const [tandaTangan, setTandaTangan] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  // Default dates values: current mock date 2026-05-22
  useEffect(() => {
    if (items.length > 0 && !itemId) {
      const firstAvail = items.find(i => i.tersedia > 0);
      if (firstAvail) {
        setItemId(firstAvail.id);
      } else {
        setItemId(items[0].id);
      }
    }
    
    // Default borrowing range
    setTanggalPinjam('2026-05-22');
    setTanggalKembali('2026-05-25');
  }, [items, isOpen]);

  // Read information about selected Item
  const selectedItem = items.find(i => i.id === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!itemId) {
      setErrorMsg('Harap pilih barang terlebih dahulu.');
      return;
    }

    if (!selectedItem) {
      setErrorMsg('Barang tidak ditemukan dalam database.');
      return;
    }

    if (jumlah <= 0) {
      setErrorMsg('Jumlah barang yang dipinjam wajib minimal 1 unit.');
      return;
    }

    if (jumlah > selectedItem.tersedia) {
      setErrorMsg(`Stok tidak mencukupi! Hanya tersedia ${selectedItem.tersedia} unit ${selectedItem.nama} saat ini.`);
      return;
    }

    const start = new Date(tanggalPinjam);
    const end = new Date(tanggalKembali);
    if (start > end) {
      setErrorMsg('Tanggal Pengembalian tidak boleh sebelum Tanggal Peminjaman.');
      return;
    }

    if (!tandaTangan) {
      setErrorMsg('Tanda tangan digital wajib digoreskan sebelum melakukan peminjaman.');
      return;
    }

    onSave({
      itemId,
      jumlah: Number(jumlah),
      tanggalPinjam,
      tanggalKembali,
      tandaTangan,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in text-gray-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-150 flex flex-col">
        
        {/* Header */}
        <div className="bg-teal-700 text-white p-4.5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-teal-200" />
            <h3 className="font-bold">Form Peminjaman Barang</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-teal-100 font-bold bg-teal-800 hover:bg-teal-900 w-7 h-7 flex items-center justify-center rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center space-x-2 border border-red-105">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pilih Alat / Barang</label>
            <select
              required
              value={itemId}
              onChange={(e) => {
                setItemId(e.target.value);
                setJumlah(1);
                setErrorMsg('');
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {items.map(item => (
                <option key={item.id} value={item.id} disabled={item.tersedia === 0}>
                  {item.nama} - [Tersedia: {item.tersedia} Unit, Kondisi: {item.kondisi}] {item.tersedia === 0 ? '(HABIS)' : ''}
                </option>
              ))}
            </select>
            {selectedItem && (
              <p className="text-[11px] text-gray-400 mt-1 italic pl-1">
                Kategori: {selectedItem.kategori} | Lokasi Rak: {selectedItem.lokasi}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jumlah Pinjam */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jumlah Pinjam (Unit)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedItem?.tersedia || 1}
                  value={jumlah}
                  onChange={(e) => {
                    setJumlah(Number(e.target.value));
                    setErrorMsg('');
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <span className="text-xs text-gray-500 font-semibold shrink-0">
                  Maksimal: {selectedItem?.tersedia || 0} unit
                </span>
              </div>
            </div>

            {/* Tanggal Mulai pinjam */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                Tanggal Pinjam
              </label>
              <input
                type="date"
                required
                value={tanggalPinjam}
                onChange={(e) => setTanggalPinjam(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Tanggal Kembali pinjam */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                Rencana Kembali
              </label>
              <input
                type="date"
                required
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Integrated Tanda Tangan Canvas Pad */}
          <div className="pt-2">
            <SignaturePad
              onSave={(base64) => {
                setTandaTangan(base64);
                setErrorMsg('');
              }}
              onClear={() => {
                setTandaTangan('');
              }}
            />
          </div>

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
              className="px-5 py-2.5 text-xs font-bold bg-teal-700 hover:bg-teal-850 text-white rounded-lg flex items-center space-x-1 shadow-md transition-all active:scale-95"
            >
              <ShieldCheck className="w-4.5 h-4.5 mr-1" />
              Sahkan Surat Pinjam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
