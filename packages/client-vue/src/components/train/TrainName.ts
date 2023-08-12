/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, VNodeChild } from 'vue';
import {
    computed, defineComponent, h, ref,
} from 'vue';
import {
    hasNormalizedSlot, injectAPIClient, normalizeSlot, wrapFnWithBusyState,
} from '../../core';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        entityName: {
            type: String as PropType<string | null | undefined>,
            default: undefined,
        },
        editable: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit, slots }) {
        const busy = ref(false);
        const name = ref('');

        const editing = ref(false);

        const nameDisplay = computed(() => {
            if (name.value) {
                return name.value;
            }

            if (props.entityName) {
                return props.entityName;
            }

            return props.entityId;
        });

        const toggle = () => {
            editing.value = !editing.value;
        };

        const save = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await injectAPIClient().train.update(props.entityId, {
                    name: name.value,
                });

                emit('updated', train);

                editing.value = false;
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return () => {
            if (editing.value) {
                return h('div', { class: 'input-group' }, [
                    h('input', {
                        value: name.value,
                        onInput($event: any) {
                            $event.preventDefault();
                            name.value = $event.target.value;
                        },
                        disabled: busy.value,
                        class: 'form-control',
                        placeholder: '...',
                    }),
                    h('button', {
                        class: 'btn btn-xs btn-primary',
                        onClick($event: any) {
                            $event.preventDefault();

                            return save();
                        },
                    }, [
                        h('i', { class: 'fa fa-save' }),
                    ]),
                ]);
            }

            let text : VNodeChild;

            if (hasNormalizedSlot('default', slots)) {
                text = normalizeSlot('default', {
                    entityId: props.entityId,
                    entityName: props.entityName,
                    nameDisplay: nameDisplay.value,
                }, slots);
            } else {
                text = [
                    nameDisplay.value,
                    ...(props.entityName ? [
                        ' ',
                        h('small', { class: 'text-muted' }, [`${props.entityId}`]),
                    ] : []),
                ];
            }

            return h('span', [
                text,
                ...(!editing.value && !!props.editable ? [
                    h('a', {
                        class: 'ms-1',
                        // eslint-disable-next-line no-script-url
                        href: 'javascript:void(0)',
                        disabled: busy.value,
                        onClick($event: any) {
                            $event.preventDefault();
                            return toggle();
                        },
                    }, [
                        h('i', { class: 'fa fa-pencil-alt' }),
                    ]),
                ] : []),
            ]);
        };
    },
});
