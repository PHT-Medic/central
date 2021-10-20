<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {LayoutNavigationAdminId} from "~/config/layout";
import StationForm from "../../../components/domains/station/StationForm";
import ServiceClientDetails from "../../../components/domains/service/ServiceClientDetails";
import {SERVICE_ID} from "@personalhealthtrain/ui-common";

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
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [
                {id: SERVICE_ID.REGISTRY, name: 'Image Registry', icon: 'fab fa-docker', version: 'v2.3.0'},
                {id: SERVICE_ID.RESULT_SERVICE, name: 'Result Service', icon: 'fa fa-file-export', version: 'v1.0.0-alpha.0'},
                {id: SERVICE_ID.SECRET_STORAGE, name: 'Secret Storage', icon: 'fas fa-user-secret', version: 'v1.8.4'},
                {id: SERVICE_ID.TRAIN_BUILDER, name: 'Train Builder', icon: 'fa fa-wrench', version: 'v1.0.0-alpha.0'},
                {id: SERVICE_ID.TRAIN_ROUTER, name: 'Train Router', icon: 'fas fa-map-marked-alt', version: 'v1.0.0-alpha.0'},
            ],
            item: undefined
        }
    },
    created() {

    },
    methods: {

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
        <div class="m-t-10">
            <div class="row">
                <div class="col-md-4 col-lg-3 col-12 mb-3" v-for="(item,key) in items" :key="key">
                    <div class="event-card p-2 d-flex flex-column text-center">
                        <div class="event-card-header">
                            <nuxt-link :to="'/admin/services/'+item.id">
                                <h3>{{item.name}}</h3>
                            </nuxt-link>
                        </div>
                        <div class="event-card-body">
                            <i :class="item.icon"></i>
                        </div>
                        <div class="event-card-footer">
                            <div class="d-flex flex-row">
                                <div class="ml-auto">
                                    <span class="foot-print">{{item.version}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.event-card {
    background-color: #ececec;
    border: 1px solid #dedede;
    border-radius: 4px;
}
.event-card-header,
.event-card-header a {
    text-decoration: none;
}
.event-card-header a:hover,
.event-card-header a:active {
    font-weight: 600;
    color: inherit;
}
.event-card-body i {
    font-size: 5rem;
}
.event-card .foot-print {
    color: #cc8181;
}

</style>
