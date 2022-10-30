<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
    data() {
        return {
            fields: [
                {
                    key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
        };
    },
    computed: {
        canView() {
            return this.$auth.has(PermissionID.USER_EDIT) ||
                this.$auth.has(PermissionID.USER_PERMISSION_ADD) ||
                this.$auth.has(PermissionID.USER_PERMISSION_DROP) ||
                this.$auth.has(PermissionID.USER_ROLE_ADD) ||
                this.$auth.has(PermissionID.USER_ROLE_DROP);
        },
        canDrop() {
            return this.$auth.has(PermissionID.USER_DROP);
        },
        managementRealmId() {
            return this.$store.getters['auth/managementRealmId'];
        },
        query() {
            return {
                filter: {
                    realm_id: this.managementRealmId,
                },
            };
        },
    },
    methods: {
        handleDeleted(item) {
            this.$emit('deleted', item);

            this.$refs.itemList.handleDeleted(item);
        },
    },
};
</script>
<template>
    <user-list
        ref="itemList"
        :query="query"
    >
        <template #header-title>
            <h6><i class="fa-solid fa-list pr-1" /> Overview</h6>
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
                        :to="'/admin/users/'+data.item.id"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <auth-entity-delete
                        v-if="canDrop"
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        :entity-type="'user'"
                        :with-text="false"
                        @deleted="handleDeleted"
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
    </user-list>
</template>
