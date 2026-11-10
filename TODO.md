# TODO LIST

- [ ] Setiap Role memiliki hak izin. Beberapa diantara hak izinnya adalah **create**, **update**, dan **delete**.
- [x] Role `user` diganti dengan `admin`, dan `admin` diganti menjadi `superadmin`.
- [ ] `superadmin` memiliki hak akses penuh, sedangkan `admin` hanya dapat melakukan **create** dan **update** terhadap resource data.
    
    > **NOTE**: `admin` tidak dapat mengakhiri sesi rapat.

- [ ] Informasi yang mengetahui dan tanda tangan-nya dapat disimpan didatabase, tanda tangan dibuat menjadi sebuah file yang disimpan difolder `storage`.
- [ ] Waktu presensi dimulai dan berakhir tidak perlukan lagi, presensi berakhir saat `superadmin` mengakhiri sesi.
- [ ] Tambahkan opsi role diform edit pengguna (tersedia dihalaman /dashboard/pengaturan/daftar-user).