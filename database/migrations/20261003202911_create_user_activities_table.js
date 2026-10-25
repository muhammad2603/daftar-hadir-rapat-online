/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("user_activities", (table) => {
        table.integer("user_id", 8)
            .unsigned()
            .nullable();
        table.string("ref_table", 255)
            .notNullable();
        table.integer("ref_value", 8)
            .notNullable();
        table.enum("operasi", [
            "insert",
            "update",
            "delete"
        ]).notNullable();
        table.boolean("is_finished")
            .notNullable()
            .defaultTo(false);
        table.timestamp("recorded_at")
            .defaultTo(knex.fn.now());
        table.timestamp("finished_at")
            .nullable()
            .defaultTo(null);
        /** Index Key */
        table.foreign("user_id", "fk_user_id_on_users")
            .references("id")
            .inTable("users")
            .onUpdate("CASCADE")
            .onDelete("SET NULL");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("user_activities");
};
