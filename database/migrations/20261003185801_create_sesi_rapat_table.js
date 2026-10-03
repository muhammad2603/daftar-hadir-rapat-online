/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("sesi_rapat", (table) => {
        table.increments();
        table.string("judul")
            .unique()
            .notNullable();
        table.text("agenda")
            .nullable()
            .defaultTo(null);
        table.string("pimpinan_rapat")
            .notNullable();
        table.string("ruang", 50)
            .notNullable();
        table.date("tanggal")
            .notNullable();
        table.time("waktu_presensi_dimulai")
            .notNullable();
        table.time("waktu_presensi_berakhir")
            .notNullable();
        table.string("file_kop_surat")
            .nullable()
            .defaultTo(null);
        table.enum("state", [
            "Belum Dimulai",
            "Sedang Berlangsung",
            "Selesai"
        ])
            .notNullable()
            .defaultTo("Belum Dimulai");
        table.string("slug")
            .notNullable();
        table.string("slug_kehadiran")
            .notNullable();
        // Membuat field created_at dan updated_at dalam timestamp
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("sesi_rapat");
}
