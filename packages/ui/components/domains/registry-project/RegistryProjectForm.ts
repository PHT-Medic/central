/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { initFormAttributesFromSource } from '@authup/client-vue';
import type { Registry, RegistryProject } from '@personalhealthtrain/central-common';
import { RegistryProjectType, createNanoID } from '@personalhealthtrain/central-common';
import { buildFormInput, buildFormSelect, buildFormSubmit } from '@vue-layout/form-controls';
import type { ListItemSlotProps } from '@vue-layout/list-controls';
import { SlotName } from '@vue-layout/list-controls';
import useVuelidate from '@vuelidate/core';
import {
    helpers, maxLength, minLength, required,
} from '@vuelidate/validators';
import type { PropType, VNodeArrayChildren } from 'vue';
import { computed } from 'vue';
import { buildValidationTranslator } from '../../../composables/ilingo';
import { wrapFnWithBusyState } from '../../../core/busy';
import RegistryList from '../registry/RegistryList';

const alphaNumHyphenUnderscore = helpers.regex(
    /^[a-z0-9-_]*$/,
);

export default defineComponent({
    name: 'RegistryProjectForm',
    props: {
        entity: {
            type: Object as PropType<RegistryProject>,
            default: undefined,
        },
        registryId: {
            type: String as PropType<Registry['id']>,
            default: undefined,
        },
    },
    emit: ['created', 'updated', 'failed'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            external_name: '',
            name: '',
            type: RegistryProjectType.DEFAULT,
            registry_id: '',
        });

        const $v = useVuelidate({
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            external_name: {
                required,
                alphaNumHyphenUnderscore,
                minLength: minLength(3),
                maxLength: maxLength(64),
            },
            type: {
                required,
            },
            registry_id: {
                required,
            },
        }, form);

        const types = [
            { id: RegistryProjectType.DEFAULT, value: 'DEFAULT' },
            { id: RegistryProjectType.STATION, value: 'Station' },
            { id: RegistryProjectType.AGGREGATOR, value: 'Aggregator' },
            { id: RegistryProjectType.INCOMING, value: 'Incoming' },
            { id: RegistryProjectType.OUTGOING, value: 'Outgoing' },
            { id: RegistryProjectType.MASTER_IMAGES, value: 'Master-Images' },
        ];

        const isRegistryLocked = computed(
            () => !!refs.registryId.value,
        );

        const isExternalNameUnchanged = computed(() => {
            if (!refs.entity.value || !refs.entity.value.external_name) {
                return true;
            }

            return refs.entity.value.external_name !== form.external_name;
        });

        const toggleForm = (key: keyof typeof form, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        const generateAlias = () => {
            form.external_name = createNanoID();
        };

        const resetAlias = () => {
            if (!refs.entity.value) return;

            form.external_name = refs.entity.value.external_name;
        };

        const initFromProperties = () => {
            if (refs.registryId.value) {
                form.registry_id = refs.registryId.value;
            }

            if (typeof refs.entity.value === 'undefined') {
                generateAlias();
            }

            initFormAttributesFromSource(form, refs.entity.value);
        };

        const updatedAt = computed(() => (refs.entity.value ?
            refs.entity.value.updated_at :
            undefined));

        initFromProperties();

        watch(updatedAt, (val, oldValue) => {
            if (val && val !== oldValue) {
                initFromProperties();
            }
        });

        const submit = wrapFnWithBusyState(busy, async () => {
            try {
                let response;

                if (refs.entity.value) {
                    response = await useAPI().registryProject.update(refs.entity.value.id, form);

                    emit('updated', response);
                } else {
                    response = await useAPI().registryProject.create(form);

                    emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return () => {
            const name = buildFormInput({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.name,
                label: true,
                labelContent: 'Name',
                value: form.name,
                onChange(input) {
                    form.name = input;
                },
            });
            const externalName = buildFormInput({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.external_name,
                label: true,
                labelContent: 'External Name',
                value: form.external_name,
                onChange(input) {
                    form.external_name = input;
                },
            });

            const externalNameHint = h('div', {
                class: ['alert alert-sm', {
                    'alert-danger': !isExternalNameUnchanged.value,
                    'alert-info': isExternalNameUnchanged.value,
                }],
            }, [
                h('div', { class: 'mb-1' }, [
                    (!isExternalNameUnchanged.value ?
                        'If you change the external_name, a new representation will be created in the Registry.' :
                        'If you don\'t want to chose a external_name by your own, you can generate one.'
                    ),
                ]),
                h('button', {
                    class: 'btn btn-xs btn-dark',
                    type: 'button',
                    onClick($event: any) {
                        $event.preventDefault();

                        generateAlias();
                    },
                }, [
                    h('i', { class: 'fa fa-wrench pe-1' }),
                    'Generate',
                ]),
                h('button', {
                    class: 'btn btn-xs btn-dark ms-1',
                    type: 'button',
                    disabled: isExternalNameUnchanged.value,
                    onClick($event: any) {
                        $event.preventDefault();

                        resetAlias();
                    },
                }, [
                    h('i', { class: 'fa fa-undo pe-1' }),
                    'Reset',
                ]),
            ]);

            const type = buildFormSelect({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.type,
                label: true,
                labelContent: 'Type',
                value: form.type,
                options: types,
                onChange(input) {
                    form.type = input;
                },
            });

            let registry : VNodeArrayChildren = [];

            if (!isRegistryLocked.value) {
                registry = [
                    h('hr'),
                    h(RegistryList, {
                        [SlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Registry>) => h('button', {
                            attrs: {
                                disabled: props.busy,
                            },
                            class: ['btn btn-xs', {
                                'btn-dark': form.registry_id !== props.data.id,
                                'btn-warning': form.registry_id === props.data.id,
                            }],
                            onClick($event: any) {
                                $event.preventDefault();

                                toggleForm('registry_id', props.data.id);
                            },
                        }, [
                            h('i', {
                                class: {
                                    'fa fa-plus': form.registry_id !== props.data.id,
                                    'fa fa-minus': form.registry_id === props.data.id,
                                },
                            }),
                        ]),
                    }),
                ];
            }

            const submitForm = buildFormSubmit({
                submit,
                busy: busy.value,
                createText: 'Create',
                updateText: 'Update',
                isEditing: !!refs.entity.value,
            });

            return h('form', {
                onSubmit($event: any) {
                    $event.preventDefault();

                    return submit();
                },
            }, [
                type,
                h('hr'),
                name,
                h('hr'),
                externalName,
                externalNameHint,
                registry,
                h('hr'),
                submitForm,
            ]);
        };
    },
});
