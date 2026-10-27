/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.alterTable("users", function (t) {
        t.boolean('is_2fa_active')
            .notNullable()
            .defaultTo(false)
            .after("role_id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.table("users", function (t) {
        t.dropColumn('is_2fa_active');
    });
};
