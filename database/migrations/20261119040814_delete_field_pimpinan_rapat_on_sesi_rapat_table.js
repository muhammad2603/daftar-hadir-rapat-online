/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.table("sesi_rapat", function (t) {
        t.dropColumn("pimpinan_rapat");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.table("sesi_rapat", function (t) {
        t.string("pimpinan_rapat")
            .notNullable()
            .after("agenda");
    });
};
