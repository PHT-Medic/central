<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script>

import {PermissionID} from "@personalhealthtrain/ui-common";
import {Layout, LayoutNavigationID} from "../../../modules/layout/contants";

export default {
    meta: {
        [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
        [Layout.REQUIRED_PERMISSIONS_KEY]: [
            PermissionID.ROLE_ADD,
            PermissionID.ROLE_EDIT,
            PermissionID.ROLE_DROP
        ]
    },
    data() {
        return {
            sidebar: {
                hide: false,
                items: [
                    {
                        name: 'Overview',
                        urlSuffix: '',
                        icon: 'fa fa-bars'
                    },
                    {
                        name: 'add',
                        urlSuffix: '/add',
                        icon: 'fa fa-plus'
                    }
                ]
            }
        }
    }
}
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            Roles <span class="sub-title">Management</span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <b-nav pills vertical>
                    <b-nav-item
                        v-for="(item,key) in sidebar.items"
                        :key="key"
                        :disabled="item.active"
                        :to="'/admin/roles' + item.urlSuffix"
                        exact
                        exact-active-class="active"
                    >
                        <i :class="item.icon" />
                        {{ item.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child />
            </div>
        </div>
    </div>
</template>
