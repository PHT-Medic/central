<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {LayoutNavigationAdminId} from "@/config/layout";
    import {dropUser, getUsers} from "@/domains/user/api.ts";
    import UserList from "@/components/user/UserList";

    export default {
        components: {UserList},
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility(can) {
                return can('add','user') || can('edit','user') || can('drop','user');
            }
        },
        data() {
            return {
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'email', label: 'Email', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'createdAt', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updatedAt', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ]
            }
        },
        methods: {
            async drop(user) {
                let l = this.$createElement;

                try {
                    let proceed = await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-info m-b-0'}, [
                        l('p', null, [
                            'Are you sure, that you want to delete: ',
                            l('b', null, [user.name]),
                            '?'
                        ])
                    ]), {
                        size: 'sm',
                        buttonSize: 'xs'
                    });

                    if(proceed) {
                        try {
                            await dropUser(user.id);
                            this.$refs['userList'].dropArrayItem(user);
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
            Users <span class="sub-title">Management</span>
        </h1>

        <user-list ref="userList" :load-on-init="true">
            <template v-slot:header-title>
                This is a slight overview of all users.
            </template>
            <template v-slot:items="props">
                <b-table :items="props.items" :fields="fields" :busy="props.busy" head-variant="'dark'" outlined>
                    <template v-slot:cell(realm)="data">
                        <span class="badge-dark badge">{{data.item.realm.name}}</span>
                    </template>
                    <template v-slot:cell(options)="data">
                        <nuxt-link
                            v-if="$auth.can('edit','user') || $auth.can('edit','user_permissions') || $auth.can('drop','user_permissions')"
                            class="btn btn-xs btn-outline-primary" :to="'/admin/users/'+data.item.id">
                            <i class="fa fa-bars"></i>
                        </nuxt-link>
                        <button v-if="$auth.can('drop','user')" @click.prevent="drop(data.item)" type="button" class="btn btn-xs btn-outline-danger" title="Löschen">
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
        </user-list>
    </div>
</template>
