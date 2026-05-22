export type Role = 'admin' | 'user';

export interface User {
  email: string;
  name: string;
  photoUrl: string;
  role: Role;
}

export interface Room {
  id: string;
  nama: string;
  lokasi: string;
  kapasitas: number;
  fasilitas: string[];
  status: 'Tersedia' | 'Dipakai' | 'Perbaikan';
  foto: string;
}

export interface Item {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  tersedia: number;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  lokasi: string;
  status: 'Tersedia' | 'Habis' | 'Perbaikan';
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  ruanganId: string;
  ruanganNama: string;
  tanggal: string; // YYYY-MM-DD
  prodi: string; // Program Studi
  jenisPraktikum: string; // Jenis Praktikum
  jamMulai: string; // HH:MM
  jamSelesai: string; // HH:MM
  keperluan: string; // Keperluan
  status: 'Disetujui' | 'Ditolak' | 'Menunggu';
  createdAt: string;
}

export interface Borrowing {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  itemId: string;
  itemNama: string;
  jumlah: number;
  tanggalPinjam: string; // YYYY-MM-DD
  tanggalKembali: string; // YYYY-MM-DD
  status: 'Belum Dikembalikan' | 'Sudah Dikembalikan';
  tandaTangan: string; // Base64 Canvas Drawing String
  tanggalDikembalikan?: string | null;
  createdAt: string;
}

export interface DBState {
  rooms: Room[];
  items: Item[];
  bookings: Booking[];
  borrowings: Borrowing[];
}
