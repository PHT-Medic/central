<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID, dropAPIRole } from '@personalhealthtrain/ui-common';
import Pagination from '../../../../components/Pagination';
import RoleList from '../../../../components/domains/role/RoleList';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    components: { RoleList, Pagination },
    meta: {
        meta: {
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.ROLE_ADD,
                PermissionID.ROLE_DROP,
                PermissionID.ROLE_EDIT,
            ],
        },
    },
    data() {
        return {
            busy: false,
            fields: [
                {
                    key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'created_at', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'updated_at', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
        };
    },
    methods: {
        async drop(role) {
            const l = this.$createElement;

            try {
                const proceed = await this.$bvModal.msgBoxConfirm(l('div', { class: 'alert alert-info m-b-0' }, [
                    l('p', null, [
                        'Are you sure, that you want to delete the role ',
                        l('b', null, [role.name]),
                        '?',
                    ]),
                ]), {
                    size: 'sm',
                    buttonSize: 'xs',
                });

                if (proceed) {
                    try {
                        await dropAPIRole(role.id);
                        this.$refs.itemsList.dropArrayItem(role);
                    } catch (e) {

                    }
                }
            } catch (e) {

            }
        },
    },
};
</script>
<template>
    <role-list
        ref="itemsList"
        :load-on-init="true"
    >
        <template #header-title>
            This is a slight overview of all roles.
        </template>
        <template #items="props">
            <b-table
                :items="props.items"
                :fields="fields"
                :busy="props.busy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(options)="data">
                    <nuxt-link
                        v-if="$auth.can('edit','role') || $auth.can('add','role_permission') || $auth.can('drop','role_permission')"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/roles/'+data.item.id"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <button
                        v-if="$auth.can('drop','role')"
                        type="button"
                        class="btn btn-xs btn-outline-danger"
                        title="Löschen"
                        @click.prevent="drop(data.item)"
                    >
                        <i class="fa fa-times" />
                    </button>
                </template>
                <template #cell(created_at)="data">
                    <timeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <timeago :datetime="data.item.updated_at" />
                </template>
                <template #table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </template>
    </role-list>
</template>
