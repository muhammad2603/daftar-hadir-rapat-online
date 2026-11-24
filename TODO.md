# TODO LIST

- [x] Setiap Role memiliki hak izin. Beberapa diantara hak izinnya adalah **create**, **update**, dan **delete**.
- [x] Role `user` diganti dengan `admin`, dan `admin` diganti menjadi `superadmin`.
- [x] `superadmin` memiliki hak akses penuh, sedangkan `admin` hanya dapat melakukan **create** dan **update** terhadap resource data.
    
  > **NOTE**: `admin` tidak dapat mengakhiri sesi rapat.

- [x] Informasi yang mengetahui dan tanda tangan-nya dibuat secara manual dihalaman monitor kehadiran sesi rapat.
- [x] Waktu presensi dimulai dan berakhir tidak perlukan lagi, presensi berakhir saat `superadmin` mengakhiri sesi.
- [x] Tambahkan opsi role diform edit pengguna dihalaman /dashboard/pengaturan/daftar-user.
- [ ] Admin diperbolehkan mengedit user, dengan catatan hanya dapat mengedit akunnya sendiri.
- [x] Buat field untuk mencatat user yang membuat sesi rapat. Digunakan dihalaman Detail Sesi Rapat.
- [ ] `superadmin` tidak dapat dirubah hak izinnya, hak izin `superadmin` dapat dilakukan hanya dari config.permissions.js.
- [ ] Jika `superadmin` mengganti user dengan role `admin` menjadi `superadmin`, pastikan hak izin user didatabase juga dihapus. Karena `superadmin` mengikuti config.permissions.js.
- [ ] Tambahkan form untuk menambah user baru (hanya untuk role `admin`) dipengaturan. Pastikan tidak ada opsi untuk mengatur role, karena default harus `admin`.
- [ ] Pastikan saat mengubah data user, user yang sedang login saat ini tidak dapat mengganti role dan hak izin pada akunnya sendiri.
- [ ] Buat halaman untuk operasi penyimpanan di Local Storage.
- [ ] Kop surat default hanya dapat ditambah atau diubah oleh `superadmin`.
- [ ] Kop surat default tidak boleh NULL, karena otomatis fallback ke nama file defaultnya. Kop surat default adalah global dan hanya dapat diubah oleh `superadmin`.
- [ ] Ubah ekstensi saat menambah/mengubah kop surat default yang hanya menerima ekstensi image/jpeg dan pastikan ekstensi file difix menjadi jpg.
- [x] Hapus field pimpinan_rapat ditable sesi_rapat.
- [ ] Hapus field is_finished dan finished_at ditable user_activities.
- [ ] Tambahkan field ditable user_activities untuk memberikan konteks aksi yang dilakukan user.
- [ ] Halaman Riwayat Sesi Rapat tidak ter-urut dari yang terbaru. Perbaiki urutan dari yang terbaru-terlama.
- [ ] Setelah menambahkan sesi rapat, server tercatat pernah mengembalikan kegagalan dalam melakukan parsing JSON. Temukan sumber masalahnya.
- [ ] Enkripsi data sensitif (PII) saat masuk ke-record Database.

# REVISI DARI DANIEL PRAKASA (PROGRAMMER DISKOMINFO BATANG HARI)

- [ ] Sesuaikan tema dengan warna khas Kabupaten Batang Hari. Lihat desain website buatan Diskominfo Batang Hari sebagai referensi.
- [ ] Monitoring kehadiran disatukan ke-dalam detail sesi rapat.
- [ ] Tambahkan waktu di input tanggal rapat.
- [ ] Input OPD didaftar kehadiran diberikan opsi select dan opsi OPD ditambahkan melalui panel admin.
- [ ] Role `admin` tidak perlu memiliki hak izin **user.create**
- [ ] Hapus kop dari halaman form daftar kehadiran.
- [ ] Monitor kehadiran tidak dibutuhkan, list kehadiran telah ada dihalaman detail sesi rapat. Kehadiran tidak perlu diberikan auto-refresh.
- [ ] Yang Mengetahui dikonfigurasi pada halaman tersendiri, biarkan `superadmin` yang melakukan konfigurasi.
- [ ] Kop surat default bisa ditambahkan per-user (masing-masing user mempunyai kop default tersendiri).
