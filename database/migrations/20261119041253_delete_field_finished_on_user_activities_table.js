/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.table("user_activities", function (t) {
        t.dropColumn("is_finished");
        t.dropColumn("finished_at");
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.table("user_activities", function (t) {
        t.boolean("is_finished")
            .notNullable()
            .defaultTo(false)
            .after("operasi");
        t.timestamp("finished_at")
            .nullable()
            .defaultTo(null)
            .after("recorded_at");
    })
};
