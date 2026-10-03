/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("sesi_rapat_kehadiran", (table) => {
        table.integer("sesi_rapat_id", 8)
            .unsigned()
            .notNullable();
        table.string("nama_pegawai", 255)
            .notNullable();
        table.string("nomor_hp", 13)
            .notNullable();
        table.string("jabatan", 255)
            .notNullable();
        table.string("nama_opd", 255)
            .notNullable();
        table.string("file_ttd", 255)
            .notNullable();
        table.timestamp("waktu_kehadiran")
            .notNullable()
            .defaultTo(knex.fn.now());
        /** Index Key */
        table.foreign("sesi_rapat_id", "fk_sesi_rapat_id_on_sesi_rapat")
            .references("id")
            .inTable("sesi_rapat")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("sesi_rapat_kehadiran");
};
