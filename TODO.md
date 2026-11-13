# TODO LIST

- [x] Setiap Role memiliki hak izin. Beberapa diantara hak izinnya adalah **create**, **update**, dan **delete**.
- [x] Role `user` diganti dengan `admin`, dan `admin` diganti menjadi `superadmin`.
- [x] `superadmin` memiliki hak akses penuh, sedangkan `admin` hanya dapat melakukan **create** dan **update** terhadap resource data.
    
  > **NOTE**: `admin` tidak dapat mengakhiri sesi rapat.

- [ ] `admin` tidak dapat memberikan atau mencabut hak izin pengguna lain.
- [ ] Informasi yang mengetahui dan tanda tangan-nya dapat disimpan didatabase, tanda tangan dibuat menjadi sebuah file yang disimpan difolder `storage`.
- [x] Waktu presensi dimulai dan berakhir tidak perlukan lagi, presensi berakhir saat `superadmin` mengakhiri sesi.
- [x] Tambahkan opsi role diform edit pengguna (tersedia dihalaman /dashboard/pengaturan/daftar-user).
- [ ] Admin diperbolehkan mengedit user, dengan catatan hanya dapat mengedit akunnya sendiri.
- [ ] Buat field untuk mencatat user yang membuat sesi rapat. Digunakan dihalaman Detail Sesi Rapat.
- [ ] Sesuaikan tema visual dengan ikon Kabupaten Batang Hari. Lihat desain aplikasi Diskominfo Batang Hari sebagai referensi.