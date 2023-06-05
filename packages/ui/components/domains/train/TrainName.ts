import type { PropType, VNodeArrayChildren } from 'vue';
import { computed, defineComponent } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';

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

        withEdit: Boolean,
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

        const save = async (close = false) => {
            if (busy.value) return;

            busy.value = true;

            try {
                const train = await useAPI().train.update(refs.entityId.value, {
                    name: name.value,
                });

                emit('updated', train);

                if (close) {
                    editing.value = false;
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        if (editing.value) {
            return () => h('input', {
                value: name.value,
                onInput($event: any) {
                    name.value = $event.target.value;
                },
                disabled: busy.value,
                class: 'form-control',
                placeholder: '...',
                onKeyupEnter($event: any) {
                    $event.preventDefault();
                    return save();
                },
            });
        }

        return () => {
            let text : VNodeArrayChildren = [];
            if (hasNormalizedSlot('default', slots)) {
                text = [normalizeSlot('default', {
                    entityId: refs.entityId.value,
                    entityName: refs.entityName.value,
                    nameDisplay: nameDisplay.value,
                })];
            } else {
                text = [
                    nameDisplay.value,
                    ...(refs.entityName.value ? [
                        h('small', { class: 'text-muted' }, [refs.entityId.value]),
                    ] : []),
                ];
            }

            return h('span', [
                ...text,
                ...(editing.value ? [
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
