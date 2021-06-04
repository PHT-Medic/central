<script>
import {LayoutNavigationAdminId} from "../../../config/layout";
import {dropStation, getStations} from "@/domains/station/api.ts";
import StationForm from "@/components/station/StationForm";

export default {
    components: {StationForm},
    meta: {
        navigationId: LayoutNavigationAdminId,
        requireLoggedIn: true,
        requireAbility: (can) => {
            return can('add','station') || can('edit','station') || can('drop','station')
        }
    },
    data() {
        return {
            isBusy: false,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'createdAt', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updatedAt', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [],
            item: undefined
        }
    },
    created() {
      this.load();
    },
    methods: {
        handleCreated(e) {
            this.$refs['form'].hide();

            this.items.push(e);
        },
        handleUpdated(e) {
            this.$refs['form'].hide();

            const index = this.items.findIndex(item => item.id === e.id);

            Object.assign(this.items[index], e);
        },
        async add() {
            this.mode = 'add';
            this.item = undefined;

            this.$refs['form'].show();
        },
        async edit(id) {
            this.mode = 'edit';
            this.item = this.items.filter((item) => item.id === id)[0];

            this.$refs['form'].show();
        },
        async load() {
            this.isBusy = true;

            try {
                const response = await getStations();
                this.items = response.data;
                this.isBusy = false;
            } catch (e) {
                console.log(e);
            }
        },
        async drop(item) {
            let l = this.$createElement;

            const procceed = await this.$bvModal.msgBoxConfirm(l('div', { class: 'alert alert-info m-b-0'}, [
                l('p', null, [
                    'Sind Sie sicher, dass Sie die Station ',
                    l('b', null, [item.name]),
                    ' löschen möchten?'
                ])
            ]), {
                size: 'sm',
                buttonSize: 'xs',
                cancelTitle: 'Abbrechen'
            });

            if(procceed) {
                try {
                    let index = this.items.findIndex((el) => {
                        return el.id === item.id
                    });

                    if(index !== -1) {
                        await dropStation(item.id);

                        this.items.splice(index,1);
                    }
                } catch (e) {

                }
            }
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
                <div class="d-flex flex-row">
                    <div>
                        <button @click.prevent="load" type="button" class="btn btn-xs btn-dark">
                            <i class="fas fa-sync"></i> Aktualisieren
                        </button>
                    </div>
                    <div style="margin-left: auto;">
                        <button @click.prevent="add" type="button" class="btn btn-xs btn-success">
                            <i class="fa fa-plus"></i> Hinzufügen
                        </button>
                    </div>
                </div>
                <div class="m-t-10">
                    <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(realm)="data">
                            <span class="badge-dark badge">{{data.item.realm.name}}</span>
                        </template>
                        <template v-slot:cell(options)="data">
                            <button v-if="$auth.can('edit','station')" @click.prevent="edit(data.item.id)" type="button" class="btn btn-xs btn-primary" title="Löschen">
                                <i class="fa fa-bars"></i>
                            </button>
                            <button v-if="$auth.can('drop','station')" @click.prevent="drop(data.item)" type="button" class="btn btn-xs btn-outline-danger" title="Löschen">
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
        <b-modal
            size="lg"
            ref="form"
            button-size="sm"
            title-html="<i class='fas fa-train'></i> Station"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <station-form  :station-property="item" @created="handleCreated" @updated="handleUpdated"/>
        </b-modal>
    </div>
</template>
