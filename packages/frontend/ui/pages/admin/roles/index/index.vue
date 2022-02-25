<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { useHTTPClient } from '@typescript-auth/vue';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
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
                    key: 'created_at', label: 'Created at', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'updated_at', label: 'Updated at', thClass: 'text-left', tdClass: 'text-left',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
        };
    },
    computed: {
        canView() {
            return this.$auth.hasPermission(PermissionID.ROLE_EDIT) ||
                this.$auth.hasPermission(PermissionID.ROLE_PERMISSION_ADD) ||
                this.$auth.hasPermission(PermissionID.ROLE_PERMISSION_DROP) ||
                this.$auth.hasPermission(PermissionID.USER_ROLE_ADD) ||
                this.$auth.hasPermission(PermissionID.USER_ROLE_DROP);
        },
        canDrop() {
            return this.$auth.hasPermission(PermissionID.ROLE_DROP);
        },
        query: {
            sort: {
                updated_at: 'DESC',
            },
        },
    },
    methods: {
        async handleDeleted(item) {
            this.$emit('deleted', item);

            this.$refs.itemsList.handleDeleted(item);
        },
    },
};
</script>
<template>
    <role-list
        ref="itemsList"
        :load-on-init="true"
        :query="query"
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
                        v-if="canView"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/roles/'+data.item.id"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <auth-entity-delete
                        v-if="canDrop"
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        :entity-type="'role'"
                        :element-text="''"
                        @done="handleDeleted"
                    />
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
