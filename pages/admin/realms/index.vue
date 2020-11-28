<script>
import {LayoutNavigationAdminId} from "../../../config/layout";
import {dropRealm, getRealms} from "@/domains/realm/api.ts";
import RealmForm from "@/components/admin/realm/RealmForm";

export default {
    components: {RealmForm},
    meta: {
        navigationId: LayoutNavigationAdminId,
        requireLoggedIn: true,
        requireAbility(can) {
            return can('add','realm') || can('edit','realm') || can('drop','realm');
        }
    },
    data() {
        return {
            item: undefined,
            mode: 'add',
            isBusy: false,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'created_at', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updated_at', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: []
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
        async load() {
            this.isBusy = true;

            try {
                this.items = await getRealms();
                this.isBusy = false;
            } catch (e) {
                this.isBusy = false;
                throw e;
            }
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
        async drop(user) {
            let l = this.$createElement;

            try {
                let proceed = await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-info m-b-0'}, [
                    l('p', null, [
                        'Sind Sie sicher, dass Sie den Realm ',
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
                            await dropRealm(user.id);

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
            Realm <span class="sub-title">Verwaltung</span>
        </h4>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary">
                    Dies ist eine Übersicht aller Realms.
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
                        <template v-slot:cell(options)="data">
                            <button
                                v-if="$auth.can('edit','realm')"
                                @click.prevent="edit(data.item.id)"
                                class="btn btn-xs btn-outline-primary"
                            >
                                <i class="fa fa-bars"></i>
                            </button>
                            <button
                                v-if="$auth.can('drop','realm') && data.item.dropAble"
                                @click.prevent="drop(data.item)"
                                type="button"
                                class="btn btn-xs btn-outline-danger"
                                title="Löschen"
                            >
                                <i class="fa fa-times"></i>
                            </button>
                        </template>
                        <template v-slot:cell(created_at)="data">
                            <timeago :datetime="data.item.createdAt" />
                        </template>
                        <template v-slot:cell(updated_at)="data">
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
            title-html="<i class='fas fa-university'></i> Realm"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <realm-form :mode-property="mode" :realm-property="item" @created="handleCreated" @updated="handleUpdated"/>
        </b-modal>
    </div>
</template>
