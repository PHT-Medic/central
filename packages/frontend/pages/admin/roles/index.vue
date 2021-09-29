<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {LayoutNavigationAdminId} from "@/config/layout";
    import {dropRole} from "@/domains/role/api.ts";
    import Pagination from "@/components/Pagination";
    import RoleList from "@/components/role/RoleList";

    export default {
        components: {RoleList, Pagination},
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility(can) {
                return can('add','role') || can('edit','role') || can('drop','role');
            }
        },
        data() {
            return {
                busy: false,
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'createdAt', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updatedAt', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ]
            }
        },
        methods: {
            async drop(role) {
                let l = this.$createElement;

                try {
                    let proceed = await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-info m-b-0'}, [
                        l('p', null, [
                            'Are you sure, that you want to delete: ',
                            l('b', null, [role.name]),
                            '?'
                        ])
                    ]), {
                        size: 'sm',
                        buttonSize: 'xs'
                    });

                    if(proceed) {
                        try {
                            await dropRole(role.id);
                            this.$refs['roleList'].dropArrayItem(role);
                        } catch (e) {

                        }
                    }
                } catch (e) {

                }
            }
        }
    }
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            Roles <span class="sub-title">Management</span>
        </h1>

        <role-list ref="roleList" :load-on-init="true">
            <template v-slot:header-title>
                This is a slight overview of all roles.
            </template>
            <template v-slot:items="props">
                <b-table :items="props.items" :fields="fields" :busy="props.busy" head-variant="'dark'" outlined>
                    <template v-slot:cell(options)="data">
                        <nuxt-link
                            v-if="$auth.can('edit','role') || $auth.can('add','rolePermission') || $auth.can('drop','rolePermission')"
                            class="btn btn-xs btn-outline-primary" :to="'/admin/roles/'+data.item.id">
                            <i class="fa fa-bars"></i>
                        </nuxt-link>
                        <button v-if="$auth.can('drop','role')" @click.prevent="drop(data.item)" type="button" class="btn btn-xs btn-outline-danger" title="Löschen">
                            <i class="fa fa-times"></i>
                        </button>
                    </template>
                    <template v-slot:cell(createdAt)="data">
                        <timeago :datetime="data.item.createdAt" />
                    </template>
                    <template v-slot:cell(updatedAt)="data">
                        <timeago :datetime="data.item.updatedAt" />
                    </template>
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle" />
                            <strong>Loading...</strong>
                        </div>
                    </template>
                </b-table>
            </template>
        </role-list>
    </div>
</template>
