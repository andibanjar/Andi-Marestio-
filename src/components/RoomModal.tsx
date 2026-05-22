import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { Plus, Check, ShieldAlert, Image } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Partial<Room>) => void;
  roomToEdit: Room | null;
}

export default function RoomModal({ isOpen, onClose, onSave, roomToEdit }: RoomModalProps) {
  const [nama, setNama] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [kapasitas, setKapasitas] = useState(30);
  const [fasilitas, setFasilitas] = useState('');
  const [status, setStatus] = useState<'Tersedia' | 'Dipakai' | 'Perbaikan'>('Tersedia');
  const [foto, setFoto] = useState('');

  useEffect(() => {
    if (roomToEdit) {
      setNama(roomToEdit.nama);
      setLokasi(roomToEdit.lokasi);
      setKapasitas(roomToEdit.kapasitas);
      setFasilitas(roomToEdit.fasilitas.join(', '));
      setStatus(roomToEdit.status);
      setFoto(roomToEdit.foto);
    } else {
      setNama('');
      setLokasi('');
      setKapasitas(30);
      setFasilitas('LCD Projector, AC, LAN Connection, Whiteboard');
      setStatus('Tersedia');
      setFoto('');
    }
  }, [roomToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !lokasi.trim()) return;

    // Split fasilitas by comma & filter empty space
    const processedFasilitas = fasilitas
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const updatedRoom: Partial<Room> = {
      id: roomToEdit?.id,
      nama,
      lokasi,
      kapasitas: Number(kapasitas),
      fasilitas: processedFasilitas,
      status,
      foto: foto.trim() || undefined
    };

    onSave(updatedRoom);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-sky-700 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-sky-200" />
            {roomToEdit ? 'Ubah Data Ruangan' : 'Tambah Ruangan Baru'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-sky-100 font-bold bg-sky-800 hover:bg-sky-900 w-7 h-7 flex items-center justify-center rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Nama Ruangan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Ruangan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Laboratorium Komputer SIFO 2"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              />
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lokasi Gedung / Lantai</label>
              <input
                type="text"
                required
                placeholder="Contoh: Gedung Syariah Lt.2"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              />
            </div>

            {/* Kapasitas */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kapasitas (Orang)</label>
              <input
                type="number"
                required
                min={1}
                max={1000}
                value={kapasitas}
                onChange={(e) => setKapasitas(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              />
            </div>

            {/* Fasilitas */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fasilitas (Pisahkan dengan koma)</label>
              <textarea
                rows={2}
                placeholder="Contoh: LCD Projector, AC, LAN Connection, Whiteboard"
                value={fasilitas}
                onChange={(e) => setFasilitas(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status Ketersediaan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Dipakai">Dipakai</option>
                <option value="Perbaikan">Dalam Perbaikan (Perbaikan)</option>
              </select>
            </div>

            {/* Foto URL Code */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center">
                <Image className="w-3.5 h-3.5 mr-1 text-gray-400" />
                URL Foto Ruangan (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... (atau kosongkan)"
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              />
            </div>

          </div>

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
              className="px-5 py-2 text-xs font-bold bg-sky-700 hover:bg-sky-850 text-white rounded-lg flex items-center space-x-1 shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4 mr-1" />
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
