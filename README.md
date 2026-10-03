# Daftar Hadir Rapat Online

Sistem informasi daftar hadir rapat online berbasis Node.js untuk mendukung pengelolaan sesi rapat, pendaftaran peserta, dan pemantauan kehadiran secara terpusat.

# Requirement

- Node.js v24.14.0 (LTS) atau lebih tinggi

# Dependencies

- Express
- EJS Template Engine
- Tailwind CSS
- Sharp
- Qreator
- Signature Pad
- Knex
- MySQL2
- Dotenv

# Installation

```bash
# Clone repo
git clone https://github.com/muhammad2603/daftar-hadir-rapat-online.git
cd daftar-hadir-rapat-online

# Install package
npm install

# Rename file .env.example
mv .env.example .env

# Migrasi database
npx knex migrate:latest

# Run
npm run server
npm run tailwind-dev

# Akses dibrowser: http://localhost:3000
```
