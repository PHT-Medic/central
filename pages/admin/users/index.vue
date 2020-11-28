<script>
    import momentHelper from "../../../modules/time/moment";

    import {LayoutNavigationAdminId} from "../../../config/layout";
    import {dropUser, getUsers} from "@/domains/user/api.ts";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility(can) {
                return can('add','user') || can('edit','user') || can('drop','user');
            }
        },
        data() {
            return {
                isBusy: false,
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'email', label: 'Email', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'createdAt', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updatedAt', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ],
                items: []
            }
        },
        created() {
            this.loadUsers().then(r => r);
        },
        methods: {
            async loadUsers() {
                this.items = await getUsers();
            },
            async dropUser(event, user) {
                event.preventDefault();

                let l = this.$createElement;

                try {
                    let proceed = await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-info m-b-0'}, [
                        l('p', null, [
                            'Sind Sie sicher, dass Sie den Benutzer ',
                            l('b', null, [user.name]),
                            ' löschen möchten?'
                        ])
                    ]), {
                        size: 'sm',
                        buttonSize: 'xs',
                        cancelTitle: 'Abbrechen'
                    });

                    if(proceed) {
                        try {
                            let index = this.items.findIndex((el) => {
                                return el.id === user.id
                            });

                            if(index !== -1) {
                                await dropUser(user.id);

                                this.items.splice(index,1);
                            }
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
        <h4 class="title">
            Benutzer <span class="sub-title">Verwaltung</span>
        </h4>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary">
                    Dies ist eine Übersicht der Benutzer.
                </div>
                <div class="d-flex flex-row">
                    <div>
                        <button type="button" class="btn btn-xs btn-dark" :disabled="isBusy" @click.prevent="loadUsers">
                            <i class="fas fa-sync"></i> Aktualisieren
                        </button>
                    </div>
                    <div style="margin-left: auto;">
                        <nuxt-link to="/admin/users/add" type="button" class="btn btn-xs btn-success">
                            <i class="fa fa-plus"></i> Hinzufügen
                        </nuxt-link>
                    </div>
                </div>
                <div class="m-t-10">
                    <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(realm)="data">
                            <span class="badge-dark badge">{{data.item.realm.name}}</span>
                        </template>
                        <template v-slot:cell(options)="data">
                            <nuxt-link
                                v-if="$auth.can('edit','user') || $auth.can('edit','user_permissions') || $auth.can('drop','user_permissions')"
                                class="btn btn-xs btn-outline-primary" :to="'/admin/users/'+data.item.id">
                                <i class="fa fa-bars"></i>
                            </nuxt-link>
                            <button v-if="$auth.can('drop','user')" @click="dropUser($event,data.item)" type="button" class="btn btn-xs btn-outline-danger" title="Löschen">
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
                </div>
            </div>
        </div>
    </div>
</template>
