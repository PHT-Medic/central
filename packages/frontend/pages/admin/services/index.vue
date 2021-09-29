<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {LayoutNavigationAdminId} from "~/config/layout";
import StationForm from "@/components/station/StationForm";
import {getServices} from "@/domains/service/api.ts";
import ServiceClientDetails from "~/components/service/ServiceClientDetails";

export default {
    components: {ServiceClientDetails, StationForm},
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
                    <nuxt-link class="btn btn-primary btn-xs" :to="'/admin/services/'+data.item.id">
                        <i class="fa fa-arrow-right"></i>
                    </nuxt-link>
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
</template>
