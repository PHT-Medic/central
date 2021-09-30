<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getRealm} from "@personalhealthtrain/ui-common/src";
import {LayoutNavigationAdminId} from "../../../config/layout";
import Vue from "vue";
import MedicineWorker from "../../../components/svg/MedicineWorker";
import MedicineDoctors from "../../../components/svg/MedicineDoctors";

export default {
    components: {MedicineDoctors, MedicineWorker},
    meta: {
        requireLoggedIn: true,
        navigationId: LayoutNavigationAdminId
    },
    async asyncData(context) {
        try {
            const realm = await getRealm(context.params.id);

            return {
                realm
            };
        } catch (e) {
            await context.redirect('/admin/realms');
        }
    },
    data() {
        return {
            realm: undefined,
            tabs: [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
                { name: 'Station', icon: 'fa fa-city', urlSuffix: '/station'},
                { name: 'Providers', icon: 'fas fa-boxes', urlSuffix: '/providers'}
            ]
        }
    },
    methods: {
        updateRealm(realm) {
            for(let key in realm) {
                Vue.set(this.realm, key, realm[key]);
            }
        }
    }
}
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{realm.name}} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex">
                        <div>
                            <b-nav pills>
                                <b-nav-item
                                    :to="'/admin/realms'"
                                    exact
                                    exact-active-class="active"
                                >
                                    <i class="fa fa-arrow-left" />
                                </b-nav-item>

                                <b-nav-item
                                    v-for="(item,key) in tabs"
                                    :key="key"
                                    :disabled="item.active"
                                    :to="'/admin/realms/' + realm.id + item.urlSuffix"
                                    exact
                                    exact-active-class="active"
                                >
                                    <i :class="item.icon" />
                                    {{ item.name }}
                                </b-nav-item>
                            </b-nav>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <nuxt-child :realm="realm" @updated="updateRealm" />
    </div>
</template>
