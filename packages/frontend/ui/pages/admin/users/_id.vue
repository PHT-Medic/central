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
            PermissionID.USER_EDIT,
            PermissionID.USER_ROLE_ADD,
            PermissionID.USER_ROLE_EDIT,
            PermissionID.USER_ROLE_DROP,
        ],
    },
    async asyncData(context) {
        let entity;

        try {
            entity = await context.$authApi.user.getOne(context.params.id, { fields: ['+email'] });

            return {
                entity,
            };
        } catch (e) {
            await context.redirect('/admin/users');

            return {

            };
        }
    },
    data() {
        return {
            entity: null,
            tabs: [
                {
                    name: 'General', routeName: 'admin-users-id', icon: 'fas fa-bars', urlSuffix: '',
                },
                {
                    name: 'Roles', routeName: 'admin-users-id-groups', icon: 'fas fa-users', urlSuffix: 'roles',
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

            this.$bvToast.toast('The user was successfully updated.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
        async handleDeleted(item) {
            this.$bvToast.toast(`The user ${item.name} was successfully deleted.`, {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            await this.$nuxt.$router.push('/admin/users');
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
                            :to="'/admin/users'"
                            exact
                            exact-active-class="active"
                        >
                            <i class="fa fa-arrow-left" />
                        </b-nav-item>
                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :disabled="item.active"
                            :to="'/admin/users/' + entity.id + '/' + item.urlSuffix"
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
