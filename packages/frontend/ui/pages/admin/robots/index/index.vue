<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/ui-common';
import RobotList from '../../../../components/domains/auth/robot/RobotList';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    components: { RobotList },
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
                    key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left',
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
        canEdit() {
            return this.$auth.hasPermission(PermissionID.ROBOT_EDIT);
        },
        canDrop() {
            return this.$auth.hasPermission(PermissionID.ROBOT_DROP);
        },
    },
};
</script>
<template>
    <robot-list
        :load-on-init="true"
        :query="query"
    >
        <template #header-title>
            This is a slight overview of all robots.
        </template>
        <template #items="props">
            <b-table
                :items="props.items"
                :fields="fields"
                :busy="props.busy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(realm)="data">
                    <span class="badge-dark badge">{{ data.item.realm_id }}</span>
                </template>
                <template #cell(options)="data">
                    <nuxt-link
                        v-if="canEdit"
                        v-b-tooltip="'Overview'"
                        :to="'/admin/robots/'+data.item.id"
                        class="btn btn-xs btn-outline-primary"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <button
                        v-if="canDrop"
                        v-b-tooltip="'Delete'"
                        :disabled="props.itemBusy"
                        type="button"
                        class="btn btn-xs btn-outline-danger"
                        @click.prevent="props.drop(data.item)"
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
    </robot-list>
</template>
