/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("auth_token_2fa", function (t) {
        t.string("challenge_id", 36)
            .primary();
        t.integer("user_id", 8)
            .unsigned()
            .notNullable();
        t.enum("purpose", ["activate", "login"])
            .notNullable();
        t.string("secret", 32)
            .notNullable();
        t.integer("attempts", 2)
            .notNullable()
            .defaultTo(0);
        t.integer("expires_at")
            .notNullable();
        t.boolean("is_used")
            .notNullable()
            .defaultTo(false);
        t.timestamp("created_at")
            .notNullable()
            .defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("auth_token_2fa");
};
