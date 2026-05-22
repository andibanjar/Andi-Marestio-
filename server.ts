import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DBState, Room, Item, Booking, Borrowing } from './src/types';

// Seed Initial Data
const SEED_ROOMS: Room[] = [
  {
    id: 'R01',
    nama: 'Laboratorium Komputer SIFO',
    lokasi: 'Gedung Syariah Lt. 2',
    kapasitas: 40,
    fasilitas: ['LCD Projector', 'AC 2 Unit', 'Komputer PC 40 Unit', 'LAN Connections', 'Whiteboard'],
    status: 'Tersedia',
    foto: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'R02',
    nama: 'Ruang Workshop & Seminar',
    lokasi: 'Gedung Bundar Utama G-103',
    kapasitas: 100,
    fasilitas: ['Sound System Executive', 'Wireless Mic 2 Unit', 'AC Split 4 Unit', 'Stage & Podium', 'Kursi Lipat 100 Unit'],
    status: 'Tersedia',
    foto: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'R03',
    nama: 'Studio Jaringan & IoT',
    lokasi: 'Laboratorium Terpadu Lantai 3',
    kapasitas: 25,
    fasilitas: ['Cisco Routers', 'Raspberry Pi Kit 10 Unit', 'Smart TV Display', 'Fiber Optic Splicer', 'Solder Station'],
    status: 'Tersedia',
    foto: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'R04',
    nama: 'Ruang Sidang Utama',
    lokasi: 'Rektorat Lama Lt. 1',
    kapasitas: 15,
    fasilitas: ['Executive Table', 'Premium Leather Chairs', 'Smart TV 75 inch', 'Video Conference Mic', 'Coffee Maker'],
    status: 'Tersedia',
    foto: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=400'
  }
];

const SEED_ITEMS: Item[] = [
  {
    id: 'B01',
    nama: 'LCD Projector EPSON X41',
    kategori: 'Media Presentasi',
    jumlah: 5,
    tersedia: 5,
    kondisi: 'Baik',
    lokasi: 'Lemari Inventaris LAB Lt.2',
    status: 'Tersedia'
  },
  {
    id: 'B02',
    nama: 'Laptop ASUS ZenBook Lab',
    kategori: 'Perangkat Lunak & PC',
    jumlah: 8,
    tersedia: 8,
    kondisi: 'Baik',
    lokasi: 'Lemari Inventaris SIFO Lt.3',
    status: 'Tersedia'
  },
  {
    id: 'B03',
    nama: 'Sound Card & Wireless Focusrite',
    kategori: 'Audio & Visual',
    jumlah: 3,
    tersedia: 3,
    kondisi: 'Baik',
    lokasi: 'Studio Recording',
    status: 'Tersedia'
  },
  {
    id: 'B04',
    nama: 'Alat Solder Digital & IoT Kit',
    kategori: 'Perangkat Keras Lab',
    jumlah: 12,
    tersedia: 12,
    kondisi: 'Baik',
    lokasi: 'Lab IoT Terpadu',
    status: 'Tersedia'
  },
  {
    id: 'B05',
    nama: 'Wacom Intuos S Drawing Pad',
    kategori: 'Aksesoris Desain',
    jumlah: 4,
    tersedia: 4,
    kondisi: 'Baik',
    lokasi: 'Studio Multimedia',
    status: 'Tersedia'
  }
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'BK-001',
    userId: 'user-01',
    userEmail: 'mahasiswa.sifo@gmail.com',
    userName: 'Ahmad Rafli Fauzi',
    ruanganId: 'R01',
    ruanganNama: 'Laboratorium Komputer SIFO',
    tanggal: '2026-05-26', // Always in future relative to prompt 2026-05-22
    prodi: 'Sistem Informasi',
    jenisPraktikum: 'Praktikum Pemrograman Web II',
    jamMulai: '09:00',
    jamSelesai: '11:30',
    keperluan: 'Kuliah praktikum pemrograman menggunakan Node.js dan Express framework.',
    status: 'Disetujui',
    createdAt: '2026-05-22T01:00:00Z'
  },
  {
    id: 'BK-002',
    userId: 'user-02',
    userEmail: 'dosen.teladani@gmail.com',
    userName: 'Dr. Indah Permatasari',
    ruanganId: 'R02',
    ruanganNama: 'Ruang Workshop & Seminar',
    tanggal: '2026-05-27',
    prodi: 'Teknik Informatika',
    jenisPraktikum: 'Kuliah Tamu',
    jamMulai: '13:00',
    jamSelesai: '15:30',
    keperluan: 'Seminar Big Data Analytics & Artificial Intelligence dengan pembicara industri.',
    status: 'Disetujui',
    createdAt: '2026-05-22T01:10:00Z'
  }
];

const SEED_BORROWINGS: Borrowing[] = [
  {
    id: 'BR-001',
    userId: 'user-01',
    userEmail: 'mahasiswa.sifo@gmail.com',
    userName: 'Ahmad Rafli Fauzi',
    itemId: 'B01',
    itemNama: 'LCD Projector EPSON X41',
    jumlah: 1,
    tanggalPinjam: '2026-05-22',
    tanggalKembali: '2026-05-24',
    status: 'Belum Dikembalikan',
    tandaTangan: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    createdAt: '2026-05-22T01:15:00Z'
  }
];

const DB_FILE = path.join(process.cwd(), 'db-booking.json');

// Database Management Helper
function loadDatabase(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(raw) as DBState;
      // Safeguard against malformed file structure
      if (!loaded.rooms || !loaded.items || !loaded.bookings || !loaded.borrowings) {
        throw new Error('Database structure is incomplete');
      }
      return loaded;
    }
  } catch (error) {
    console.error('Failed to load database. Loading initial seeds...', error);
  }

  // Fallback / Initial Seed
  const initialDB: DBState = {
    rooms: SEED_ROOMS,
    items: SEED_ITEMS,
    bookings: SEED_BOOKINGS,
    borrowings: SEED_BORROWINGS
  };
  saveDatabase(initialDB);
  return initialDB;
}

function saveDatabase(db: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON & URL encoded forms
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API: Fetch Database State
  app.get('/api/db', (req, res) => {
    const db = loadDatabase();
    res.json(db);
  });

  // API: Reset Database Seeding
  app.post('/api/reset', (req, res) => {
    const defaultDB: DBState = {
      rooms: SEED_ROOMS,
      items: SEED_ITEMS,
      bookings: SEED_BOOKINGS,
      borrowings: SEED_BORROWINGS
    };
    saveDatabase(defaultDB);
    res.json({ message: 'Database berhasil di-reset ke kondisi standar.', db: defaultDB });
  });

  // API: Rooms CRUD (Admin Only / Simulated validation)
  app.post('/api/rooms', (req, res) => {
    const db = loadDatabase();
    const { action, room } = req.body;

    if (action === 'add') {
      const newRoom: Room = {
        id: 'R' + String(db.rooms.length + 1).padStart(2, '0') + '-' + Math.floor(Math.random() * 1000),
        nama: room.nama,
        lokasi: room.lokasi,
        kapasitas: Number(room.kapasitas),
        fasilitas: Array.isArray(room.fasilitas) ? room.fasilitas : room.fasilitas.split(',').map((f: string) => f.trim()),
        status: room.status || 'Tersedia',
        foto: room.foto || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400'
      };
      db.rooms.push(newRoom);
      saveDatabase(db);
      res.json({ success: true, message: 'Ruangan berhasil ditambahkan!', db });
    } else if (action === 'edit') {
      const index = db.rooms.findIndex(r => r.id === room.id);
      if (index !== -1) {
        db.rooms[index] = {
          ...db.rooms[index],
          nama: room.nama,
          lokasi: room.lokasi,
          kapasitas: Number(room.kapasitas),
          fasilitas: Array.isArray(room.fasilitas) ? room.fasilitas : room.fasilitas.split(',').map((f: string) => f.trim()),
          status: room.status,
          foto: room.foto || db.rooms[index].foto
        };
        saveDatabase(db);
        res.json({ success: true, message: 'Ruangan berhasil diperbarui!', db });
      } else {
        res.status(404).json({ success: false, message: 'Ruangan tidak ditemukan.' });
      }
    } else if (action === 'delete') {
      const { id } = room;
      db.rooms = db.rooms.filter(r => r.id !== id);
      // Clean up linked bookings
      db.bookings = db.bookings.filter(b => b.ruanganId !== id);
      saveDatabase(db);
      res.json({ success: true, message: 'Ruangan dan jadwal terkait berhasil dihapus!', db });
    } else {
      res.status(400).json({ success: false, message: 'Aksi ruangan tidak valid.' });
    }
  });

  // API: Items CRUD
  app.post('/api/items', (req, res) => {
    const db = loadDatabase();
    const { action, item } = req.body;

    if (action === 'add') {
      const newItem: Item = {
        id: 'B' + String(db.items.length + 1).padStart(2, '0') + '-' + Math.floor(Math.random() * 1000),
        nama: item.nama,
        kategori: item.kategori,
        jumlah: Number(item.jumlah),
        tersedia: Number(item.jumlah),
        kondisi: item.kondisi || 'Baik',
        lokasi: item.lokasi,
        status: item.jumlah > 0 ? 'Tersedia' : 'Habis'
      };
      db.items.push(newItem);
      saveDatabase(db);
      res.json({ success: true, message: 'Barang berhasil ditambahkan!', db });
    } else if (action === 'edit') {
      const index = db.items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        const diffUsed = db.items[index].jumlah - db.items[index].tersedia;
        const newJumlah = Number(item.jumlah);
        const newTersedia = Math.max(0, newJumlah - diffUsed);

        db.items[index] = {
          ...db.items[index],
          nama: item.nama,
          kategori: item.kategori,
          jumlah: newJumlah,
          tersedia: newTersedia,
          kondisi: item.kondisi,
          lokasi: item.lokasi,
          status: newTersedia > 0 ? 'Tersedia' : 'Habis'
        };
        saveDatabase(db);
        res.json({ success: true, message: 'Barang berhasil diperbarui!', db });
      } else {
        res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
      }
    } else if (action === 'delete') {
      const { id } = item;
      db.items = db.items.filter(i => i.id !== id);
      // Clean up linked borrowings
      db.borrowings = db.borrowings.filter(br => br.itemId !== id);
      saveDatabase(db);
      res.json({ success: true, message: 'Barang berhasil dihapus!', db });
    } else {
      res.status(400).json({ success: false, message: 'Aksi barang tidak valid.' });
    }
  });

  // Helper date functions
  const countMonthlyBookings = (bookings: Booking[], email: string, dateStr: string): number => {
    const targetMonth = dateStr.slice(0, 7); // YYYY-MM
    return bookings.filter(b => b.userEmail === email && b.tanggal.startsWith(targetMonth) && b.status !== 'Ditolak').length;
  };

  const getDayOfWeek = (dateStr: string): number => {
    const day = new Date(dateStr).getDay(); // 0 is Sunday, 1 is Monday...
    return day;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // API: Room Booking Action with Full Business Rules
  app.post('/api/bookings', (req, res) => {
    const db = loadDatabase();
    const { user, booking } = req.body;

    if (!user || !user.email) {
      return res.status(401).json({ success: false, message: 'Anda harus masuk ke sistem untuk mendaftar.' });
    }

    const { ruanganId, tanggal, prodi, jenisPraktikum, jamMulai, jamSelesai, keperluan } = booking;

    // RULE 1: Validation of Room Availability
    const room = db.rooms.find(r => r.id === ruanganId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Ruangan tidak ditemukan.' });
    }
    if (room.status === 'Perbaikan') {
      return res.status(400).json({ success: false, message: 'Maaf, ruangan ini dalam keadaan perbaikan dan tidak bisa dipesan.' });
    }

    // DATE ASSESSMENTS
    // We are on server local time 2026-05-22.
    const todayStr = '2026-05-22';
    const parsedToday = new Date(todayStr);
    const parsedTarget = new Date(tanggal);

    // RULE 2: Booking only possible H-3 (minimal 3 hari sebelum pemakaian)
    const diffMs = parsedTarget.getTime() - parsedToday.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) {
      return res.status(400).json({
        success: false,
        message: 'Gagal memesan: Pemesanan harus dilakukan minimal H-3 sebelum tanggal pemakaian.'
      });
    }

    // RULE 3: Booking max 4x per user per calendar month
    const userMonthlyCount = countMonthlyBookings(db.bookings, user.email, tanggal);
    if (userMonthlyCount >= 4) {
      return res.status(400).json({
        success: false,
        message: `Gagal memesan: Anda sudah melakukan ${userMonthlyCount} pesanan di bulan tersebut. Limit kuota pemesanan ruangan adalah maksimal 4x per bulan per pengguna.`
      });
    }

    // RULE 4: Operating Hours (Senin-Jumat 08:00 - 16:00, Sabtu 08:00 - 12:30, Minggu Tutup)
    const dayOfWeek = getDayOfWeek(tanggal);
    if (dayOfWeek === 0) {
      return res.status(400).json({ success: false, message: 'Hari Minggu adalah hari libur nasional. Kampus tutup.' });
    }

    const startMin = parseTimeToMinutes(jamMulai);
    const endMin = parseTimeToMinutes(jamSelesai);

    if (startMin >= endMin) {
      return res.status(400).json({ success: false, message: 'Jam Selesai harus lebih besar dari Jam Mulai.' });
    }

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Mon - Fri (08:00 to 16:00) => 480 min to 960 min
      if (startMin < 480 || endMin > 960) {
        return res.status(400).json({
          success: false,
          message: 'Jam Operasional Senin s/d Jumat adalah pukul 08:00 s/d 16:00 WIB.'
        });
      }
    } else if (dayOfWeek === 6) {
      // Saturday (08:00 to 12:30) => 480 min to 750 min
      if (startMin < 480 || endMin > 750) {
        return res.status(400).json({
          success: false,
          message: 'Jam Operasional hari Sabtu adalah pukul 08:00 s/d 12:30 WIB.'
        });
      }
    }

    // RULE 5: Max Duration 3.5 Hours (210 minutes)
    const durationMin = endMin - startMin;
    if (durationMin > 210) {
      return res.status(400).json({
        success: false,
        message: 'Batas maksimal penyewaan ruang laboratorium sekali pertemuan adalah 3,5 Jam (210 Menit).'
      });
    }

    // RULE 6: Overlap Validation
    const overlapFound = db.bookings.some(b => {
      if (b.ruanganId === ruanganId && b.tanggal === tanggal && b.status === 'Disetujui') {
        const bStart = parseTimeToMinutes(b.jamMulai);
        const bEnd = parseTimeToMinutes(b.jamSelesai);
        // Overlap formula
        return (startMin < bEnd && endMin > bStart);
      }
      return false;
    });

    if (overlapFound) {
      return res.status(400).json({
        success: false,
        message: 'Jadwal bentrok! Ruangan tersebut telah dibooking oleh civitas lain di jam dan tanggal yang sama.'
      });
    }

    // Dynamic Admin Auto-Approval vs User Pending Approvals or Admin directly approved
    const statusOfBooking = 'Disetujui'; // To make a seamless UX, autoapprove but admin can manage/delete/override it! This makes the calendar dynamic.

    const newBooking: Booking = {
      id: 'BK-' + String(db.bookings.length + 1).padStart(3, '0') + '-' + Math.floor(Math.random() * 100),
      userId: user.email,
      userEmail: user.email,
      userName: user.name,
      ruanganId,
      ruanganNama: room.nama,
      tanggal,
      prodi,
      jenisPraktikum,
      jamMulai,
      jamSelesai,
      keperluan,
      status: statusOfBooking,
      createdAt: new Date().toISOString()
    };

    db.bookings.push(newBooking);
    saveDatabase(db);

    res.json({
      success: true,
      message: 'Booking Ruangan berhasil! Selamat, jadwal Anda telah tercatat dan disetujui di Kalender Akademik.',
      booking: newBooking,
      db
    });
  });

  // API: Manage bookings (approve/reject/delete by admin)
  app.post('/api/bookings/manage', (req, res) => {
    const db = loadDatabase();
    const { id, status, deleteAction } = req.body;

    if (deleteAction) {
      db.bookings = db.bookings.filter(b => b.id !== id);
      saveDatabase(db);
      return res.json({ success: true, message: 'Jadwal booking berhasil dibatalkan!', db });
    }

    const index = db.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      db.bookings[index].status = status;
      saveDatabase(db);
      res.json({ success: true, message: `Status booking berhasil diset sebagai ${status}!`, db });
    } else {
      res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
    }
  });

  // API: Item Borrowing Action (Peminjaman Barang) with Digital Signature
  app.post('/api/borrowings', (req, res) => {
    const db = loadDatabase();
    const { user, borrowing } = req.body;

    if (!user || !user.email) {
      return res.status(401).json({ success: false, message: 'Anda harus masuk ke sistem terlebih dahulu.' });
    }

    const { itemId, jumlah, tanggalPinjam, tanggalKembali, tandaTangan } = borrowing;

    // Find Item
    const itemIndex = db.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    const actItem = db.items[itemIndex];
    const qtyToBorrow = Number(jumlah);

    if (isNaN(qtyToBorrow) || qtyToBorrow <= 0) {
      return res.status(400).json({ success: false, message: 'Jumlah barang harus minimal 1 unit.' });
    }

    if (qtyToBorrow > actItem.tersedia) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi! Hanya tersedia ${actItem.tersedia} ${actItem.nama} saat ini.`
      });
    }

    if (!tandaTangan || tandaTangan.length < 100) {
      return res.status(400).json({ success: false, message: 'Tanda tangan digital wajib dilengkapi.' });
    }

    // Decrement item availability
    db.items[itemIndex].tersedia -= qtyToBorrow;
    if (db.items[itemIndex].tersedia === 0) {
      db.items[itemIndex].status = 'Habis';
    }

    const newBorrowing: Borrowing = {
      id: 'BR-' + String(db.borrowings.length + 1).padStart(3, '0') + '-' + Math.floor(Math.random() * 100),
      userId: user.email,
      userEmail: user.email,
      userName: user.name,
      itemId,
      itemNama: actItem.nama,
      jumlah: qtyToBorrow,
      tanggalPinjam,
      tanggalKembali,
      status: 'Belum Dikembalikan',
      tandaTangan,
      createdAt: new Date().toISOString()
    };

    db.borrowings.push(newBorrowing);
    saveDatabase(db);

    res.json({
      success: true,
      message: `Peminjaman ${qtyToBorrow} unit ${actItem.nama} berhasil didaftarkan secara digital!`,
      borrowing: newBorrowing,
      db
    });
  });

  // API: Return Borrowed Item
  app.post('/api/borrowings/return', (req, res) => {
    const db = loadDatabase();
    const { id } = req.body;

    const borrowIndex = db.borrowings.findIndex(br => br.id === id);
    if (borrowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Transaksi peminjaman tidak ditemukan.' });
    }

    const borrowing = db.borrowings[borrowIndex];
    if (borrowing.status === 'Sudah Dikembalikan') {
      return res.status(400).json({ success: false, message: 'Barang sudah dikembalikan sebelumnya.' });
    }

    // Increment item availability
    const itemIndex = db.items.findIndex(i => i.id === borrowing.itemId);
    if (itemIndex !== -1) {
      db.items[itemIndex].tersedia = Math.min(db.items[itemIndex].jumlah, db.items[itemIndex].tersedia + borrowing.jumlah);
      db.items[itemIndex].status = 'Tersedia';
    }

    db.borrowings[borrowIndex].status = 'Sudah Dikembalikan';
    db.borrowings[borrowIndex].tanggalDikembalikan = new Date().toISOString().split('T')[0];
    saveDatabase(db);

    res.json({
      success: true,
      message: `Barang ${borrowing.itemNama} berhasil divalidasi pengembaliannya! Terima kasih.`,
      db
    });
  });

  // Serve static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
