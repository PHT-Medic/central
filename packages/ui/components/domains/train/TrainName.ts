/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, VNodeChild } from 'vue';
import { computed, defineComponent } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';
import { wrapFnWithBusyState } from '../../../core/busy';

export default defineComponent({
    name: 'TrainName',
    props: {
        entityId: {
            type: String,
            required: true,
        },
        entityName: {
            type: String as PropType<string | null>,
            default: undefined,
        },
        editable: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit, slots }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const name = ref('');

        const editing = ref(false);

        watch(refs.entityName, (val, oldValue) => {
            if (val && val !== oldValue) {
                if (val) {
                    name.value = val;
                }
            }
        });

        if (refs.entityName.value) {
            name.value = refs.entityName.value;
        }

        const nameDisplay = computed(() => {
            if (name.value || refs.entityName.value) {
                return name.value || refs.entityName.value;
            }

            return refs.entityId.value;
        });

        const toggle = () => {
            editing.value = !editing.value;
        };

        const save = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await useAPI().train.update(refs.entityId.value, {
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
                    entityId: refs.entityId.value,
                    entityName: refs.entityName.value,
                    nameDisplay: nameDisplay.value,
                }, slots);
            } else {
                text = [
                    nameDisplay.value,
                    ...(refs.entityName.value ? [
                        ' ',
                        h('small', { class: 'text-muted' }, [`${refs.entityId.value}`]),
                    ] : []),
                ];
            }

            return h('span', [
                text,
                ...(!editing.value && !!refs.editable.value ? [
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
