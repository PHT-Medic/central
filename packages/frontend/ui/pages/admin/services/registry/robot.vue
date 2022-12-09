<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { RobotForm, useHTTPClient } from '@authup/vue2';
import Vue, { VNode } from 'vue';
import { ServiceID } from '@personalhealthtrain/central-common';
import { MASTER_REALM_ID } from '@authup/common';

export default {
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
                        name: ServiceID.REGISTRY,
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
    render(h) : VNode {
        const vm = this;

        return h(RobotForm, {
            props: {
                name: ServiceID.REGISTRY,
                realmId: MASTER_REALM_ID,
                entity: vm.item,
            },
            on: {
                updated(item) {
                    vm.handleUpdated.call(null, item);
                },
            },
        });
    },
};
</script>
