<script>
import {LayoutNavigationAdminId} from "../../../config/layout";
import StationForm from "@/components/station/StationForm";
import {getServices} from "@/domains/service/api.ts";
import ServiceDetails from "@/components/service/ServiceDetails";

export default {
    components: {ServiceDetails, StationForm},
    meta: {
        navigationId: LayoutNavigationAdminId,
        requireLoggedIn: true,
        requireAbility: (can) => {
            return can('manage','service')
        }
    },
    data() {
        return {
            busy: false,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'clientSynced', label: 'Synced', thClass: 'text-center', tdClass: 'text-center'},
                { key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'createdAt', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updatedAt', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left' },
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
        handleUpdated(e) {
            const index = this.items.findIndex(item => item.id === e.id);

            Object.assign(this.items[index], e);
        },
        handleCloseCommand() {
            this.$refs['form'].hide();
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
            this.busy = true;

            try {
                const response = await getServices({
                    include: ['realm', 'client']
                });

                this.items = response.data;
                this.busy = false;
            } catch (e) {
                console.log(e);
            }
        }
    }
}
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            Services <span class="sub-title">Management</span>
        </h1>

        <p>
            This is a slight overview of all services.
        </p>
        <div class="d-flex flex-row">
            <div>
                <button @click.prevent="load" type="button" class="btn btn-xs btn-dark">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
        </div>
        <div class="m-t-10">
            <b-table :items="items" :fields="fields" :busy="busy" head-variant="'dark'" outlined>
                <template v-slot:cell(clientSynced)="data">
                    <i class="fa" :class="{
                        'fa-check text-success': data.item.clientSynced,
                        'fa-times text-danger': !data.item.clientSynced
                    }" />
                </template>
                <template v-slot:cell(realm)="data">
                    <span class="badge-dark badge">{{data.item.realm.name}}</span>
                </template>
                <template v-slot:cell(options)="data">
                    <button v-if="$auth.can('manage','service')" @click.prevent="edit(data.item.id)" type="button" class="btn btn-xs btn-primary" title="Löschen">
                        <i class="fa fa-bars"></i>
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

        <b-modal
            size="lg"
            ref="form"
            button-size="sm"
            title-html="<i class='fas fa-concierge-bell'></i> Service"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <service-details :service-property="item" @updated="handleUpdated" @close="handleCloseCommand"/>
        </b-modal>
    </div>
</template>
