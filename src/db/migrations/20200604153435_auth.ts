import * as Knex from 'knex';

export async function up(knex: Knex) : Promise<any> {
    return knex.schema
        .createTable('auth_realms', (table) => {
            table.increments('id');
            table.string('name', 100);
            table.text('description');
        })

        .createTable('auth_providers', (table) => {
            table.increments('id');
            table.integer('realm_id').references('id').inTable('auth_realms');
            table.string('scheme', 10).defaultTo(null); // oauth2 | openid
            table.string('grant_type', 10).defaultTo(null); // code | password
            table.string('token_url', 512).defaultTo(null); // http://....
            table.string('user_info_url', 512).defaultTo(null);
            table.string('client_id', 256).defaultTo(null); // d8a13daxa3123csdr3ay1
            table.string('client_secret', 512).defaultTo(null); // da31g3cv13g4r32h4552qa1
        })

        .createTable('auth_permissions', (table) => {
            table.increments('id');
            table.string('name', 128);
            table.string('title', 256).defaultTo(null);
            table.text('description').defaultTo(null);
            table.boolean('power_configurable').defaultTo(false);
            table.boolean('power_inverse_configurable').defaultTo(false);
            table.boolean('scope_configurable').defaultTo(false);
            table.date('created_at').defaultTo(new Date().toISOString());
            table.date('updated_at').defaultTo(new Date().toISOString());

            table.index('name');
        })

        .createTable('auth_roles', (table) => {
            table.increments('id');
            table.string('name', 30);
            table.string('keycloak_role_id', 100).defaultTo(null);
            table.date('created_at').defaultTo(new Date().toISOString());
            table.date('updated_at').defaultTo(new Date().toISOString());

            table.index('name');
        })

        .createTable('auth_role_permissions', (table) => {
            table.increments('id');
            table.integer('role_id').references('id').inTable('auth_roles');
            table.integer('permission_id').references('id').inTable('auth_permissions');
            table.boolean('enabled').defaultTo(1);
            table.integer('power',3).defaultTo(999);
            table.integer('power_inverse', 3).defaultTo(null);
            table.json('scope').defaultTo(null);
            table.json('condition').defaultTo(null);
            table.date('created_at').defaultTo(new Date().toISOString());
            table.date('updated_at').defaultTo(new Date().toISOString());

            table.index('permission_id');
            table.index('role_id');
            table.index(['permission_id', 'role_id']);
        })

        .createTable('auth_users', (table) => {
            table.increments('id');
            table.string('name', 30)
            table.string('email', 255).defaultTo(null);
            table.string('password', 512).defaultTo(null);
            table.date('created_at').defaultTo(new Date().toISOString());
            table.date('updated_at').defaultTo(new Date().toISOString());

            table.index('name');
        })

        .createTable('auth_user_providers', (table) => {
            table.increments('id');
            table.string('provider_id', 100);
            table.string('provider_user_id', 100);
            table.string('provider_user_name', 255);
            table.string('access_token').defaultTo(null);
            table.string('refresh_token').defaultTo(null);
            table.date('expires_in').defaultTo(null);
            table.date('created_at').defaultTo(new Date().toISOString());
            table.date('updated_at').defaultTo(new Date().toISOString());

            table.integer('user_id').references('id').inTable('auth_users');

            table.index(['provider_id', 'provider_user_id']);
            table.index(['provider_id', 'provider_user_name']);
            table.index('user_id');
        })

        .createTable('auth_user_roles', (table) => {
            table.integer('user_id').references('id').inTable('auth_users');
            table.integer('role_id').references('id').inTable('auth_roles');
            table.date('created_at').defaultTo(new Date().toISOString());
            table.date('updated_at').defaultTo(new Date().toISOString());

            table.index(['user_id', 'role_id']);
        });
}

export async function down(knex: Knex) : Promise<any> {
    return knex.schema
        .dropTableIfExists('auth_permissions')
        .dropTableIfExists('auth_roles')
        .dropTableIfExists('auth_role_permissions')
        .dropTableIfExists('auth_users')
        .dropTableIfExists('auth_user_providers')
        .dropTableIfExists('auth_user_roles');
}
