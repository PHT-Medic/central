<!--
  Copyright (c) 2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { TrainLog } from '@personalhealthtrain/central-common';
import {
    defineComponent, h, toRefs,
} from 'vue';
import type { PropType, VNode, VNodeArrayChildren } from 'vue';

export default defineComponent({
    name: 'TrainLog',
    props: {
        index: {
            type: Number,
            default: 0,
        },
        entity: {
            type: Object as PropType<TrainLog>,
            required: true,
        },
    },
    setup(props) {
        const refs = toRefs(props);

        let message : VNode;
        if (refs.entity.value.error) {
            const parts : VNodeArrayChildren = ['An error '];

            if (refs.entity.value.error_code) {
                parts.push('with error code ');
                parts.push(h('strong', refs.entity.value.error_code));
                parts.push(' ');
            }

            if (refs.entity.value.step) {
                parts.push('during the step ');
                parts.push(h('strong', refs.entity.value.step));
                parts.push(' ');
            }

            parts.push('occurred');

            message = h('span', parts);
        } else if (refs.entity.value.status) {
            message = h('span', [
                'Event ',
                h('strong', refs.entity.value.event),
                ' triggered and status changed to ',
                h('strong', refs.entity.value.status),
            ]);
        } else {
            message = h('span', [
                'Event ',
                h('strong', refs.entity.value.event),
                ' triggered',
            ]);
        }

        return h(
            'div',
            {
                class: `line line-${refs.index.value + 1}`,
            },
            [
                h('div', { class: 'line-number' }, [refs.index.value + 1]),
                h('div', { class: 'line-content d-flex flex-row' }, [
                    h('div', { staticClass: `line-component ${refs.entity.value.component}` }, [
                        `${refs.entity.value.component}/${refs.entity.value.command}`,
                    ]),
                    h('div', { staticClass: 'line-message', class: { error: refs.entity.value.error } }, [
                        message,
                    ]),
                    h('div', { staticClass: 'ml-auto' }, [
                        h('timeago', { props: { datetime: refs.entity.value.created_at } }),
                    ]),
                ]),
            ],
        );
    },
});
</script>
