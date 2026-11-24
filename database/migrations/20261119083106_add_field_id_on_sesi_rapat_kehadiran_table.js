/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.raw(`
        ALTER TABLE sesi_rapat_kehadiran 
        ADD COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY 
        AFTER sesi_rapat_id
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.table("sesi_rapat_kehadiran", function (t) {
        t.dropColumn("id");
    });
};
