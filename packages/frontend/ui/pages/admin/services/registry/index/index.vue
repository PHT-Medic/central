<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout';
import { RegistryList } from '../../../../../components/domains/registry/RegistryList';

export default {
    components: { RegistryList },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
    data() {
        return {
            fields: [
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
        query() {
            return {
                sort: {
                    updated_at: 'DESC',
                },
            };
        },
        canManage() {
            return this.$auth.hasPermission(PermissionID.REGISTRY_MANAGE);
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
    <registry-list
        ref="itemsList"
        :load-on-init="true"
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
                        v-if="canManage"
                        v-b-tooltip="'Overview'"
                        :to="'/admin/services/registry/'+data.item.id"
                        class="btn btn-xs btn-outline-primary"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <entity-delete
                        v-if="canManage"
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        :entity-type="'registry'"
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
    </registry-list>
</template>
