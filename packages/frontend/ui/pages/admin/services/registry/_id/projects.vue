<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { PermissionID } from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import { Realm } from '@authup/common';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REGISTRY_MANAGE,
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

                ],
            },
        };
    },
};
</script>
<template>
    <nuxt-child :entity="entity" />
</template>
