<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

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
            entity = await context.$api.registry.getOne(context.params.id, {
                fields: ['+account_secret'],
            });

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
                    name: 'Setup', icon: 'fa-solid fa-cog', urlSuffix: 'setup',
                },
                {
                    name: 'Projects',
                    icon: 'fa-solid fa-diagram-project',
                    urlSuffix: 'projects',
                    components: [
                        {
                            name: 'overview',
                            urlSuffix: '',
                            icon: 'fa fa-bars',
                        },
                        {
                            name: 'add',
                            urlSuffix: '/add',
                            icon: 'fa fa-plus',
                        },
                    ],
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
        <div class="text-center">
            <h3 class="title no-border mb-3">
                {{ entity.name }}
            </h3>

            <hr>
        </div>

        <div>
            <div class="content-wrapper">
                <div class="content-sidebar flex-column">
                    <b-nav
                        pills
                        vertical
                    >
                        <template v-for="(item,key) in tabs">
                            <b-nav-item-dropdown
                                v-if="item.components"
                                :key="key"
                                :text="item.name"
                                :html="'<i class=\''+item.icon+'\'></i> '+item.name"
                                right
                            >
                                <b-dropdown-item
                                    v-for="(subItem, subIndex) in item.components"
                                    :key="subIndex"
                                    :to="'/admin/services/registry/' + entity.id + '/' + item.urlSuffix + subItem.urlSuffix"
                                >
                                    <i :class="subItem.icon" />
                                    {{ subItem.name }}
                                </b-dropdown-item>
                            </b-nav-item-dropdown>
                            <b-nav-item
                                v-if="!item.components"
                                :key="key"
                                :disabled="item.active"
                                :to="'/admin/services/registry/' + entity.id + '/' + item.urlSuffix"
                                exact
                                exact-active-class="active"
                            >
                                <i :class="item.icon" />
                                {{ item.name }}
                            </b-nav-item>
                        </template>
                    </b-nav>
                </div>
                <div class="content-container">
                    <nuxt-child
                        :entity="entity"
                        @updated="handleUpdated"
                        @deleted="handleDeleted"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
