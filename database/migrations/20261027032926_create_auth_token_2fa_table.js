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
            .nullable();
        t.integer("attempts", 2)
            .notNullable()
            .defaultTo(0);
        t.bigInteger("expires_at")
            .notNullable();
        t.boolean("is_used")
            .notNullable()
            .defaultTo(false);
        t.enum("used_reason", [
            "verified",
            "superseded",
            "locked",
            "expired",
            "send_failed"
        ])
            .nullable()
            .defaultTo(null);
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
