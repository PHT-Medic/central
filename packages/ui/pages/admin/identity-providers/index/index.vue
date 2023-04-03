<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    PermissionID,
} from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import { Realm } from '@authup/core';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROVIDER_ADD,
            PermissionID.PROPOSAL_EDIT,
            PermissionID.PROPOSAL_DROP,
        ],
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
                {
                    key: 'options', label: '', tdClass: 'text-left',
                },
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
        };
    },
    computed: {
        canDrop() {
            return this.$auth.has(PermissionID.PROVIDER_DROP);
        },
        query() {
            return {
                filter: {
                    realm_id: this.managementRealmId,
                },
                fields: ['+client_secret'],
            };
        },
        managementRealmId() {
            return this.$store.getters['auth/managementRealmId'];
        },
    },
    methods: {
        async handleDeleted(item) {
            this.$bvToast.toast('The provider was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            this.$refs.itemsList.handleDeleted(item);
        },
    },
};
</script>
<template>
    <div>
        <identity-provider-list
            ref="itemsList"
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
                            class="btn btn-xs btn-outline-primary"
                            :to="'/admin/identity-providers/'+data.item.id"
                        >
                            <i class="fa fa-bars" />
                        </nuxt-link>
                        <auth-entity-delete
                            v-if="canDrop"
                            class="btn btn-xs btn-outline-danger"
                            :entity-id="data.item.id"
                            :entity-type="'oauth2Provider'"
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
        </identity-provider-list>
    </div>
</template>
