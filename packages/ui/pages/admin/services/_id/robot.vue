<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { ServiceID } from '@personalhealthtrain/central-common';
import { useAPIClient } from '@authup/vue2';
import type { PropType } from 'vue';
import Vue from 'vue';

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
                const response = await useAPIClient().robot.getMany({
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
        handleUpdated(item) {
            const keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.item, keys[i], item[keys[i]]);
            }

            this.$bvToast.toast('The robot was successfully updated.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
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
            @updated="handleUpdated"
        />
    </div>
</template>
