<!--
  Copyright (c) 2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { TrainLog } from '@personalhealthtrain/central-common';
import type {
    CreateElement, PropType, VNode, VNodeChildren,
} from 'vue';

export default {
    name: 'TrainLog',
    props: {
        index: {
            type: Number,
            default: 0,
        },
        entity: Object as PropType<TrainLog>,
    },
    computed: {
        time() {
            return this.entity.created_at;
        },
    },
    render(h: CreateElement) : VNode {
        const vm = this;

        let message : VNode;
        if (this.entity.error) {
            const parts : VNodeChildren = ['An error '];

            if (this.entity.error_code) {
                parts.push('with error code ');
                parts.push(h('strong', vm.entity.error_code));
                parts.push(' ');
            }

            if (this.entity.step) {
                parts.push('during the step ');
                parts.push(h('strong', vm.entity.step));
                parts.push(' ');
            }

            parts.push('occurred');

            message = h('span', parts);
        } else if (this.entity.status) {
            message = h('span', [
                'Event ',
                h('strong', vm.entity.event),
                ' triggered and status changed to ',
                h('strong', vm.entity.status),
            ]);
        } else {
            message = h('span', [
                'Event ',
                h('strong', vm.entity.event),
                ' triggered',
            ]);
        }

        return h(
            'div',
            {
                staticClass: `line line-${vm.index + 1}`,
            },
            [
                h('div', { staticClass: 'line-number' }, [vm.index + 1]),
                h('div', { staticClass: 'line-content d-flex flex-row' }, [
                    h('div', { staticClass: `line-component ${vm.entity.component}` }, [
                        `${vm.entity.component}/${vm.entity.command}`,
                    ]),
                    h('div', { staticClass: 'line-message', class: { error: vm.entity.error } }, [
                        message,
                    ]),
                    h('div', { staticClass: 'ml-auto' }, [
                        h('timeago', { props: { datetime: vm.entity.created_at } }),
                    ]),
                ]),
            ],
        );
    },
};
</script>
