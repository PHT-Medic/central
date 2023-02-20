<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import type { Realm } from '@authup/common';
import { LayoutKey } from '../../../../config/layout';

export default {
    props: {
        entity: Object as PropType<Realm>,
    },
    meta: {
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REALM_EDIT,
        ],
    },
    methods: {
        handleUpdated(e) {
            this.$emit('updated', e);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
};
</script>
<template>
    <div>
        <realm-form
            :entity="entity"
            @updated="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
