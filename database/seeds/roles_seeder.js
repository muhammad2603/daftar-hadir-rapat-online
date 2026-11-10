/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;")
  await knex('roles').truncate();
  await knex('roles').insert([
    { id: 1, nama: 'Super Admin', identitas: 'superadmin' },
    { id: 2, nama: 'Admin', identitas: 'admin' }
  ]);
  knex.raw("SET FOREIGN_KEY_CHECKS = 1");
};
