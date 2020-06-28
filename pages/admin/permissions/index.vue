<script>
    import UserEdge from "../../../services/edge/user/userEdge";
    import momentHelper from "../../../services/time/helpers/momentHelper";

    import {adminNavigationId} from "../../../config/layout";
    import PermissionEdge from "../../../services/edge/permission/permissionEdge";

    export default {
        meta: {
            navigationId: adminNavigationId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add','permission') || can('edit','permission') || can('drop','user_permission')
            }
        },
        async asyncData(context) {
            try {
                const items = await PermissionEdge.getPermissions();

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
                    { key: 'description', label: 'Beschreibung', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'createdAt', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updatedAt', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ],
                items: []
            }
        },
        computed: {
            formattedItems() {
                return this.items.map((item) => {
                    item.created_at_formatted = momentHelper(item.createdAt, 'YYYY-MM-DD HH:II:SS').fromNow(false);
                    item.updated_at_formatted = momentHelper(item.updatedAt, 'YYYY-MM-DD HH:II:SS').fromNow(false);
                    return item;
                })
            }
        },
        methods: {
            dropUser(event, permission) {
                event.preventDefault();

                let l = this.$createElement;



                this.$bvModal.msgBoxConfirm(l('div', { class: 'alert alert-info m-b-0'}, [
                    l('p', null, [
                        'Sind Sie sicher, dass Sie die Berechtigung ',
                        l('b', null, [permission.name]),
                        ' löschen möchten?'
                    ])
                ]), {
                    size: 'sm',
                    buttonSize: 'xs',
                    cancelTitle: 'Abbrechen'
                })
            }
        }
    }
</script>
<template>
    <div>
        <h4 class="title">
            Berechtigungen <span class="sub-title">Verwaltung</span>
        </h4>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary">
                    Dies ist eine Übersicht der Berechtigungen.
                </div>
                <div class="m-t-10">
                    <b-table :items="formattedItems" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(name)="data">
                            {{data.item.namePretty}} <small>({{data.item.name}})</small>
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
