/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  await knex('roles').del()
  await knex('roles').insert([
    { id: 1, nama: 'admin' },
    { id: 2, nama: 'user' }
  ]);
};
