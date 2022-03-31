<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REALM_EDIT,
            PermissionID.REALM_DROP,
        ],
    },
    data() {
        return {
            item: undefined,
            mode: 'add',
            isBusy: false,
            fields: [
                {
                    key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
            items: [],
        };
    },
    computed: {
        canEdit() {
            return this.$auth.hasPermission(PermissionID.REALM_EDIT);
        },
        canDrop() {
            return this.$auth.hasPermission(PermissionID.REALM_DROP);
        },
    },
    methods: {
        handleDeleted(item) {
            this.$emit('deleted', item);

            this.$refs.itemsList.handleDeleted(item);
        },
    },
};
</script>
<template>
    <realm-list ref="itemsList">
        <template #header-title>
            <h6><i class="fa-solid fa-list pr-1" /> Overview</h6>
        </template>
        <template #header-actions="props">
            <div class="d-flex flex-row">
                <div>
                    <button
                        type="button"
                        class="btn btn-xs btn-dark"
                        :disabled="props.busy"
                        @click.prevent="props.load"
                    >
                        <i class="fas fa-sync" /> Refresh
                    </button>
                </div>
            </div>
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
                        v-if="canEdit"
                        v-b-tooltip="'Overview'"
                        :to="'/admin/realms/'+data.item.id"
                        class="btn btn-xs btn-outline-primary"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <auth-entity-delete
                        v-if="canDrop && data.item.drop_able"
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        :entity-type="'realm'"
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
    </realm-list>
</template>
