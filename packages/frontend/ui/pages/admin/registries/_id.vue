<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REGISTRY_MANAGE,
        ],
    },
    async asyncData(context) {
        let entity;

        try {
            entity = await context.$api.registry.getOne(context.params.id);

            return {
                entity,
            };
        } catch (e) {
            await context.redirect('/admin/registries');

            return {

            };
        }
    },
    data() {
        return {
            entity: null,
            tabs: [
                {
                    name: 'General', icon: 'fas fa-bars', urlSuffix: '',
                },
                {
                    name: 'Projects', icon: 'fa-solid fa-diagram-project', urlSuffix: 'projects',
                },
                {
                    name: 'Setup', icon: 'fa-solid fa-cog', urlSuffix: 'setup',
                },
            ],
        };
    },
    methods: {
        handleUpdated(item) {
            const keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                this.entity[keys[i]] = item[keys[i]];
            }

            this.$bvToast.toast('The registry was successfully updated.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
        async handleDeleted() {
            this.$bvToast.toast('The registry was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            await this.$nuxt.$router.push('/admin/registries');
        },
    },
};
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{ entity.name }} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <b-nav pills>
                        <b-nav-item
                            :to="'/admin/registries'"
                            exact
                            exact-active-class="active"
                        >
                            <i class="fa fa-arrow-left" />
                        </b-nav-item>
                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :disabled="item.active"
                            :to="'/admin/registries/' + entity.id + '/' + item.urlSuffix"
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

        <nuxt-child
            :entity="entity"
            @updated="handleUpdated"
            @deleted="handleDeleted"
        />
    </div>
</template>
