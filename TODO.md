# TODO LIST

- [x] Setiap Role memiliki hak izin. Beberapa diantara hak izinnya adalah **create**, **update**, dan **delete**.
- [x] Role `user` diganti dengan `admin`, dan `admin` diganti menjadi `superadmin`.
- [x] `superadmin` memiliki hak akses penuh, sedangkan `admin` hanya dapat melakukan **create** dan **update** terhadap resource data.
    
  > **NOTE**: `admin` tidak dapat mengakhiri sesi rapat.

- [ ] Informasi yang mengetahui dan tanda tangan-nya dibuat secara manual dihalaman monitor kehadiran sesi rapat.
- [x] Waktu presensi dimulai dan berakhir tidak perlukan lagi, presensi berakhir saat `superadmin` mengakhiri sesi.
- [x] Tambahkan opsi role diform edit pengguna dihalaman /dashboard/pengaturan/daftar-user.
- [ ] Admin diperbolehkan mengedit user, dengan catatan hanya dapat mengedit akunnya sendiri.
- [x] Buat field untuk mencatat user yang membuat sesi rapat. Digunakan dihalaman Detail Sesi Rapat.
- [ ] Sesuaikan tema visual dengan ikon Kabupaten Batang Hari. Lihat desain aplikasi Diskominfo Batang Hari sebagai referensi.
- [ ] Saat melakukan update perizinan pengguna oleh `superadmin`, `admin` hanya dapat melakukan **user.create**.
- [ ] `superadmin` tidak dapat dirubah hak izinnya, hak izin `superadmin` dapat dilakukan hanya dari config.permissions.js.
- [ ] Jika `superadmin` mengganti user dengan role `admin` menjadi `superadmin`, pastikan hak izin user didatabase juga dihapus. Karena `superadmin` mengikuti config.permissions.js.
- [ ] Tambahkan form untuk menambah user baru (hanya untuk role `admin`) dipengaturan. Pastikan tidak ada opsi untuk mengatur role, karena default harus `admin`.
- [ ] Pastikan saat mengubah data user, user yang sedang login saat ini tidak dapat mengganti role dan hak izin pada akunnya sendiri.