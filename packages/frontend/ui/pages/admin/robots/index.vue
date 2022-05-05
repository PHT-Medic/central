<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script>

import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.ROBOT_ADD,
            PermissionID.ROBOT_EDIT,
            PermissionID.ROBOT_DROP,
            PermissionID.ROBOT_ROLE_ADD,
            PermissionID.ROBOT_ROLE_EDIT,
            PermissionID.ROBOT_ROLE_DROP,
        ],
    },
    data() {
        return {
            sidebar: {
                hide: false,
                items: [
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
        };
    },
    methods: {
        async handleDeleted(item) {
            this.$bvToast.toast(`The robot ${item.name} was successfully deleted.`, {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
        async handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
};
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            Robot <span class="sub-title">Management</span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <b-nav
                    pills
                    vertical
                >
                    <b-nav-item
                        v-for="(item,key) in sidebar.items"
                        :key="key"
                        :disabled="item.active"
                        :to="'/admin/robots' + item.urlSuffix"
                        exact
                        exact-active-class="active"
                    >
                        <i :class="item.icon" />
                        {{ item.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child
                    @deleted="handleDeleted"
                    @failed="handleFailed"
                />
            </div>
        </div>
    </div>
</template>
