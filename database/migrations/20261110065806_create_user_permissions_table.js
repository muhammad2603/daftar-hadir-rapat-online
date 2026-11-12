/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("user_permissions", function (t) {
        t.integer("user_id", 8)
            .unsigned()
            .notNullable()
            .references("id").inTable("users").onDelete("CASCADE");
        t.string("permission", 100)
            .notNullable();
        t.enum("effect", ["grant", "deny"])
            .notNullable();
        t.integer("affected_by", 8)
            .unsigned()
            .nullable()
            .references("id").inTable("users").onDelete("SET NULL");
        t.timestamp("created_at")
            .defaultTo(knex.fn.now());
        t.timestamp("updated_at")
            .defaultTo(knex.fn.now());
        t.primary(["user_id", "permission"]);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("user_permissions");
};
