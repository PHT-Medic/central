/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'AssignmentToggleButton',
    props: {
        id: {
            type: [String, Number],
            default: undefined,
        },
        ids: {
            type: Array,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['toggle'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const isSelected = computed(() => (Array.isArray(refs.ids.value) ?
            refs.ids.value.indexOf(refs.id.value) !== -1 : false));

        const toggle = () => {
            emit('toggle', refs.id);
        };

        return () => h('button', {
            class: ['btn btn-xs', {
                'btn-warning': isSelected.value,
                'btn-success': !isSelected.value,
            }],
            type: 'button',
            onClick($event: any) {
                $event.preventDefault();

                return toggle();
            },
        }, [
            h('i', {
                class: ['fa', {
                    'fa-plus': !isSelected.value,
                    'fa-minus': isSelected.value,
                }],
            }),
        ]);
    },
});
