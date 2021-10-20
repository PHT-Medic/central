<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {LayoutNavigationAdminId} from "../../../config/layout";
    import PermissionList from "../../../components/domains/permission/PermissionList";

    export default {
        components: {PermissionList},
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add','permission') || can('edit','permission') || can('drop','user_permission')
            }
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
    <div class="container">
        <h1 class="title no-border mb-3">
            Permissions <span class="sub-title">Management</span>
        </h1>

        <permission-list ref="roleList" :load-on-init="true">
            <template v-slot:header-title>
                This is a slight overview of all roles.
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
    </div>
</template>
