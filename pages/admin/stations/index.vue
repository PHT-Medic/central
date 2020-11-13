<script>
import {LayoutNavigationAdminId} from "../../../config/layout";
import {getStations} from "@/domains/station/api.ts";

export default {
    meta: {
        navigationId: LayoutNavigationAdminId,
        requireLoggedIn: true,
        requireAbility: (can) => {
            return can('add','station') || can('edit','station') || can('drop','station')
        }
    },
    async asyncData(context) {
        try {
            const items = await getStations();

            return {
                items
            }
        } catch (e) {
            console.log(e);
            //await context.redirect('/admin');
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
        dropPermission(event, permission) {
            event.preventDefault();

            let l = this.$createElement;

            this.$bvModal.msgBoxConfirm(l('div', { class: 'alert alert-info m-b-0'}, [
                l('p', null, [
                    'Sind Sie sicher, dass Sie die Station ',
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
    <div class="container">
        <h4 class="title">
            Stationen <span class="sub-title">Verwaltung</span>
        </h4>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary">
                    Eine Übersicht aller Stationen.
                </div>
                <div class="m-t-10">
                    <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(name)="data">
                            {{data.item.name}}
                        </template>
                        <template v-slot:cell(created_at)="data">
                            {{data.item.createdAt}}
                        </template>
                        <template v-slot:cell(updated_at)="data">
                            {{data.item.updatedAt}}
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
