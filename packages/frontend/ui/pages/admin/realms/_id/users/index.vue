<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID } from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import { Realm } from '@authelion/common';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
    props: {
        entity: Object as PropType<Realm>,
    },
    data() {
        return {
            query: {
                filters: {
                    realm_id: this.entity.id,
                },
            },
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
            return this.$auth.hasPermission(PermissionID.USER_EDIT) ||
                this.$auth.hasPermission(PermissionID.USER_PERMISSION_ADD) ||
                this.$auth.hasPermission(PermissionID.USER_PERMISSION_DROP) ||
                this.$auth.hasPermission(PermissionID.USER_ROLE_ADD) ||
                this.$auth.hasPermission(PermissionID.USER_ROLE_DROP);
        },
        canDrop() {
            return this.$auth.hasPermission(PermissionID.USER_DROP);
        },
    },
    methods: {
        async handleDeleted(item) {
            this.$bvToast.toast('The user was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            this.$refs.itemsList.handleDeleted(item);
        },
    },
};
</script>
<template>
    <user-list
        ref="itemsList"
        :query="query"
        :load-on-init="true"
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
                        v-if="canView"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/realms/'+entity.id+'/users/'+data.item.id"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <auth-entity-delete
                        v-if="canDrop"
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        :entity-type="'user'"
                        :with-text="false"
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
    </user-list>
</template>
