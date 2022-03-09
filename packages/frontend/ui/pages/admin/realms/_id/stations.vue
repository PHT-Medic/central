<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { PermissionID } from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import { Realm } from '@typescript-auth/domains';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.STATION_EDIT,
            PermissionID.STATION_DROP,
            PermissionID.STATION_ADD,
        ],
    },
    props: {
        entity: Object as PropType<Realm>,
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
};
</script>
<template>
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
                    :to="'/admin/realms/'+entity.id+'/stations' + item.urlSuffix"
                    exact
                    exact-active-class="active"
                >
                    <i :class="item.icon" />
                    {{ item.name }}
                </b-nav-item>
            </b-nav>
        </div>
        <div class="content-container">
            <nuxt-child :entity="entity" />
        </div>
    </div>
</template>
