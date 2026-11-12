/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.table("sesi_rapat", function (t) {
        t.dropColumns(["waktu_presensi_dimulai", "waktu_presensi_berakhir"]);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.table("sesi_rapat", function (t) {
        t.time("waktu_presensi_dimulai")
            .notNullable()
            .after("tanggal");
        t.time("waktu_presensi_berakhir")
            .notNullable()
            .after("waktu_presensi_dimulai");
    })
};
