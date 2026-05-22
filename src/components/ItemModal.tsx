import React, { useState, useEffect } from 'react';
import { Item } from '../types';
import { Check, Package, Layers } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>) => void;
  itemToEdit: Item | null;
}

export default function ItemModal({ isOpen, onClose, onSave, itemToEdit }: ItemModalProps) {
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [jumlah, setJumlah] = useState(5);
  const [kondisi, setKondisi] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');
  const [lokasi, setLokasi] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setNama(itemToEdit.nama);
      setKategori(itemToEdit.kategori);
      setJumlah(itemToEdit.jumlah);
      setKondisi(itemToEdit.kondisi);
      setLokasi(itemToEdit.lokasi);
    } else {
      setNama('');
      setKategori('Media Presentasi');
      setJumlah(5);
      setKondisi('Baik');
      setLokasi('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !lokasi.trim() || !kategori.trim()) return;

    const updatedItem: Partial<Item> = {
      id: itemToEdit?.id,
      nama,
      kategori,
      jumlah: Number(jumlah),
      kondisi,
      lokasi,
    };

    onSave(updatedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-teal-700 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center">
            <Package className="w-5 h-5 mr-2 text-teal-200" />
            {itemToEdit ? 'Ubah Data Inventaris Barang' : 'Tambah Barang Inventaris'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-teal-100 font-bold bg-teal-800 hover:bg-teal-900 w-7 h-7 flex items-center justify-center rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nama Barang */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Alat / Barang</label>
            <input
              type="text"
              required
              placeholder="Contoh: LCD Projector EPSON S400"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-350 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Kategori */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-350 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              >
                <option value="Media Presentasi">Media Presentasi</option>
                <option value="Perangkat Lunak & PC">Perangkat PC/IT</option>
                <option value="Audio & Visual">Audio & Visual</option>
                <option value="Perangkat Keras Lab">Perangkat Keras Lab</option>
                <option value="Aksesoris Desain">Aksesoris Desain</option>
                <option value="ATK Pendukung">ATK Pendukung</option>
              </select>
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jumlah Unit</label>
              <input
                type="number"
                required
                min={1}
                max={500}
                value={jumlah}
                onChange={(e) => setJumlah(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-350 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            {/* Kondisi */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kondisi Alat</label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-350 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              >
                <option value="Baik">Sangat Baik (Baik)</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            {/* Lokasi Penyimpanan */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lokas Penyimpanan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Lemari LAB Utama"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-350 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
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
              className="px-5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-850 text-white rounded-lg flex items-center space-x-1 shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4 mr-1" />
              Simpan Barang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
