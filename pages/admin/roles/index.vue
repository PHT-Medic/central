<script>
    import momentHelper from "../../../modules/time/moment";

    import {LayoutNavigationAdminId} from "../../../config/layout";
    import {dropRole, getRoles} from "@/domains/role/api.ts";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility(can) {
                return can('add','role') || can('edit','role') || can('drop','role');
            }
        },
        async asyncData(context) {
            try {
                const items = await getRoles();

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
                    { key: 'createdAt', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updatedAt', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ],
                items: []
            }
        },
        methods: {
            async dropRole(event, role) {
                event.preventDefault();

                let l = this.$createElement;

                try {
                    let proceed = await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-info m-b-0'}, [
                        l('p', null, [
                            'Sind Sie sicher, dass Sie die Rolle ',
                            l('b', null, [role.name]),
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
                                return el.id === role.id
                            });

                            if(index !== -1) {
                                await dropRole(role.id);

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
            Rollen <span class="sub-title">Verwaltung</span>
        </h4>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary">
                    Dies ist eine Übersicht der Rollen.
                </div>
                <div class="d-flex flex-row">
                    <div>
                        <button type="button" class="btn btn-xs btn-dark">
                            <i class="fas fa-sync"></i> Aktualisieren
                        </button>
                    </div>
                    <div style="margin-left: auto;">
                        <nuxt-link to="/admin/roles/add" type="button" class="btn btn-xs btn-success">
                            <i class="fa fa-plus"></i> Hinzufügen
                        </nuxt-link>
                    </div>
                </div>
                <div class="m-t-10">
                    <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(options)="data">
                            <nuxt-link
                                v-if="$auth.can('edit','role') || $auth.can('add','rolePermission') || $auth.can('drop','rolePermission')"
                                class="btn btn-xs btn-outline-primary" :to="'/admin/roles/'+data.item.id">
                                <i class="fa fa-bars"></i>
                            </nuxt-link>
                            <button v-if="$auth.can('drop','role')" @click="dropRole($event,data.item)" type="button" class="btn btn-xs btn-outline-danger" title="Löschen">
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
