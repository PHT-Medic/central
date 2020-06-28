<script>
    import UserEdge from "../../../services/edge/user/userEdge";
    import momentHelper from "../../../services/time/helpers/momentHelper";

    import {adminNavigationId} from "../../../config/layout";

    export default {
        meta: {
            navigationId: adminNavigationId,
            requireLoggedIn: true,
            requireAbility(can) {
                return can('add','user') || can('edit','user') || can('drop','user');
            }
        },
        async asyncData(context) {
            try {
                const items = await UserEdge.getUsers();

                return {
                    items
                }
            } catch (e) {
                await context.redirect('/admin');
            }
        },
        data() {
            return {
                isBusy: false,
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'email', label: 'Email', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'created_at', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updated_at', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ],
                items: []
            }
        },
        computed: {
            formattedItems() {
                return this.items.map((item) => {
                    item.created_at_formatted = momentHelper(item.created_at, 'YYYY-MM-DD HH:II:SS').fromNow(false);
                    item.updated_at_formatted = momentHelper(item.updated_at, 'YYYY-MM-DD HH:II:SS').fromNow(false);
                    return item;
                })
            }
        },
        methods: {
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
                                await UserEdge.dropUser(user.id);

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
    <div>
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
                        <button type="button" class="btn btn-xs btn-dark">
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
                    <b-table :items="formattedItems" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(options)="data">
                            <nuxt-link
                                v-if="$can('edit','user') || $can('edit','user_permissions') || $can('drop','user_permissions')"
                                class="btn btn-xs btn-outline-primary" :to="'/admin/users/'+data.item.id">
                                <i class="fa fa-bars"></i>
                            </nuxt-link>
                            <button v-if="$can('drop','user')" @click="dropUser($event,data.item)" type="button" class="btn btn-xs btn-outline-danger" title="Löschen">
                                <i class="fa fa-times"></i>
                            </button>
                        </template>
                        <template v-slot:cell(created_at)="data">
                            {{data.item.created_at_formatted}}
                        </template>
                        <template v-slot:cell(updated_at)="data">
                            {{data.item.updated_at_formatted}}
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
