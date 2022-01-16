<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/ui-common';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.ROBOT_EDIT,
            PermissionID.ROBOT_ROLE_ADD,
            PermissionID.ROBOT_ROLE_EDIT,
            PermissionID.ROBOT_ROLE_DROP,
        ],
    },
    async asyncData(context) {
        let entity;

        try {
            entity = await context.$authApi.robot.getOne(context.params.id, {
                fields: ['+secret'],
            });

            return {
                entity,
            };
        } catch (e) {
            await context.redirect('/admin/robots');

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
                    name: 'Roles', icon: 'fas fa-users', urlSuffix: 'roles',
                },
                {
                    name: 'Permissions', icon: 'fas fa-key', urlSuffix: 'permissions',
                },
            ],
        };
    },
    methods: {
        handleUpdated(e) {
            // eslint-disable-next-line no-restricted-syntax
            for (const key in e) {
                this.entity[key] = e[key];
            }
        },
        async handleDeleted() {
            await this.$nuxt.$router.push('/admin/robots');
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
                            :to="'/admin/robots'"
                            exact
                            exact-active-class="active"
                        >
                            <i class="fa fa-arrow-left" />
                        </b-nav-item>
                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :disabled="item.active"
                            :to="'/admin/robots/' + entity.id + '/' + item.urlSuffix"
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
            :entity-property="entity"
            @updated="handleUpdated"
            @deleted="handleDeleted"
        />
    </div>
</template>
