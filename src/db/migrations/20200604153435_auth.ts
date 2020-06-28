import * as Knex from 'knex';

export async function up(knex: Knex) : Promise<any> {
    return knex.schema
        .createTable('auth_users', (table) => {
            table.increments('id');
            table.string('name', 30)
            table.string('email', 255).notNullable();
            table.string('password', 512).notNullable();
            table.date('created_at').defaultTo(knex.fn.now());
            table.date('updated_at').defaultTo(knex.fn.now());

            table.index('name');
        })

        .createTable('auth_permissions', (table) => {
            table.increments('id');
            table.string('name', 128);
            table.string('title', 256);
            table.text('description').defaultTo(null);
            table.boolean('power_configurable').defaultTo(false);
            table.boolean('power_inverse_configurable').defaultTo(false);
            table.boolean('scope_configurable').defaultTo(false);
            table.date('created_at').defaultTo(knex.fn.now());
            table.date('updated_at').defaultTo(knex.fn.now());

            table.index('name');
        })

        .createTable('auth_user_permissions', (table) => {
            table.increments('id');
            table.integer('user_id').defaultTo(0);
            table.integer('permission_id').defaultTo(0);
            table.boolean('enabled').defaultTo(1);
            table.integer('power',3).defaultTo(999);
            table.integer('power_inverse', 3).defaultTo(null);
            table.json('scope').defaultTo(null);
            table.json('condition').defaultTo(null);
            table.date('created_at').defaultTo(knex.fn.now());
            table.date('updated_at').defaultTo(knex.fn.now());

            table.index('permission_id');
            table.index('user_id');
            table.index(['permission_id', 'user_id']);
        })
};

export async function down(knex: Knex) : Promise<any> {
    return knex.schema
        .dropTableIfExists('auth_users')
        .dropTableIfExists('auth_permissions')
        .dropTableIfExists('auth_user_permissions');
}
