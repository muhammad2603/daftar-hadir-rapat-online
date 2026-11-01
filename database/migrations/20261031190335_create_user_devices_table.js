/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("user_devices", function (table) {
        table.uuid('id').defaultTo(knex.fn.uuid());
        table.integer('user_id')
            .notNullable();
        table.specificType('device_token_hash', 'CHAR(64)')
            .notNullable();
        table.text('user_agent')
            .nullable();
        table.specificType('last_country', 'CHAR(2)')
            .nullable();
        table.string('last_city', 100)
            .nullable();
        table.bigint('last_asn')
            .nullable();
        table.timestamp('trusted_until', { useTz: true, precision: 3 })
            .notNullable();
        table.timestamp('revoked_at', { useTz: true, precision: 3 })
            .nullable();
        table.timestamp('first_seen_at', { useTz: true, precision: 3 })
            .notNullable()
            .defaultTo(knex.fn.now());
        table.timestamp('last_seen_at', { useTz: true, precision: 3 })
            .notNullable()
            .defaultTo(knex.fn.now());
        table.primary('id');
        table.unique(["user_id", "device_token_hash"], {
            indexName: 'idx_devices_token'
        });
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("user_devices");
};
