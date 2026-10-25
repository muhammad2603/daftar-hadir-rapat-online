/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("users", (table) => {
        table.increments();
        table.string("username", 255)
            .unique()
            .notNullable();
        table.string("email", 255)
            .unique()
            .nullable()
            .defaultTo(null);
        table.string("password", 255)
            .notNullable();
        table.integer("role_id", 8)
            .unsigned()
            .notNullable();
        table.datetime("last_login")
            .nullable()
            .defaultTo(null);
        table.timestamps(true, true);
        /** Index Key */
        table.foreign("role_id", "fk_role_id_on_roles")
            .references("id")
            .inTable("roles")
            .onUpdate("CASCADE")
            .onDelete("RESTRICT");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("users");
};
