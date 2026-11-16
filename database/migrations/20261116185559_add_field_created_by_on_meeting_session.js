/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.alterTable("sesi_rapat", function (t) {
        t.integer("created_by", 8)
            .unsigned()
            .references("id").inTable("users").onDelete("SET NULL")
            .nullable()
            .after("slug_kehadiran");
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.alterTable("sesi_rapat", function (t) {
        t.dropForeign("created_by", "sesi_rapat_created_by_foreign");
        t.dropColumn("created_by");
    });
};
