<!--
  - Copyright (c) 2021-2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
    import PermissionList from "../../../../components/domains/permission/PermissionList";
    import {Layout, LayoutNavigationID} from "../../../../modules/layout/contants";

    export default {
        components: {PermissionList},
        meta: {
            [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        },
        data() {
            return {
                isBusy: false,
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'created_at', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updated_at', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ]
            }
        },
        methods: {
        }
    }
</script>
<template>
    <permission-list ref="roleList" :load-on-init="true">
        <template v-slot:header-title>
            This is a slight overview of all permissions.
        </template>
        <template v-slot:items="props">
            <b-table :items="props.items" :fields="fields" :busy="props.busy" head-variant="'dark'" outlined>
                <template v-slot:cell(created_at)="data">
                    <timeago :datetime="data.item.created_at" />
                </template>
                <template v-slot:cell(updated_at)="data">
                    <timeago :datetime="data.item.updated_at" />
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </template>
    </permission-list>
</template>
