<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ServiceID } from '@personalhealthtrain/central-common';
import { useHTTPClient } from '@typescript-auth/vue';
import { PropType } from 'vue';

export default {
    props: {
        entityId: String as PropType<ServiceID>,
    },
    data() {
        return {
            item: null,
            busy: false,
        };
    },
    created() {
        Promise.resolve()
            .then(this.load);
    },
    methods: {
        async load() {
            try {
                const response = await useHTTPClient().robot.getMany({
                    filter: {
                        name: this.entityId,
                    },
                    fields: ['+secret'],
                });

                if (response.meta.total === 1) {
                    // eslint-disable-next-line prefer-destructuring
                    this.item = response.data[0];
                }
            } catch (e) {
                // ...
            }
        },
    },
};
</script>
<template>
    <div>
        <robot-form
            v-if="item"
            :name="entityId"
            :realm-id="item.realm_id"
            :entity="item"
        />
    </div>
</template>
