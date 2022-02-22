<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    PermissionID,
} from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout/contants';

export default {
    props: {
        entity: Object,
    },
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
                    key: 'openId', label: 'OpenID?', thClass: 'text-center', tdClass: 'text-center',
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
            return this.$auth.hasPermission(PermissionID.PROVIDER_DROP);
        },
        query() {
            return {
                filter: {
                    realm_id: this.entity.id,
                },
                fields: ['+client_secret'],
            };
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
    <div class="container">
        <o-auth2-provider-list
            ref="itemsList"
            :query="query"
        >
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
                            :to="'/admin/realms/'+entity.id+'/providers/'+data.item.id"
                        >
                            <i class="fa fa-bars" />
                        </nuxt-link>
                        <auth-entity-delete
                            v-if="canDrop"
                            class="btn btn-xs btn-outline-danger"
                            :entity-id="data.item.id"
                            :entity-type="'oauth2Provider'"
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
                    <template #cell(openId)="data">
                        <i
                            class="fa"
                            :class="{
                                'fa-check text-success': data.item.open_id,
                                'fa-times text-danger': !data.item.open_id
                            }"
                        />
                    </template>
                    <template #table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle" />
                            <strong>Loading...</strong>
                        </div>
                    </template>
                </b-table>
            </template>
        </o-auth2-provider-list>
    </div>
</template>
