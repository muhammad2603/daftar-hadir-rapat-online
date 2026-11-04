import bcrypt from 'bcrypt';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {
      id: 1,
      username: 'fattahillah',
      email: 'zidanhp255@gmail.com',
      password: await bcrypt.hash("Admin123@", 12),
      role_id: 1,
      last_login: null,
    },
    {
      id: 2,
      username: 'budi',
      email: 'nc71678@gmail.com',
      password: await bcrypt.hash("User123@", 12),
      role_id: 2,
      last_login: null,
    },
    {
      id: 3,
      username: 'hanypul',
      email: null,
      password: await bcrypt.hash("User456@", 12),
      role_id: 2,
      last_login: null,
    }
  ]);
};
