/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { RealmList } from '@authup/client-vue';
import type { Registry, Station } from '@personalhealthtrain/central-common';
import {
    Ecosystem,
    alphaNumHyphenUnderscoreRegex,
    isHex,
} from '@personalhealthtrain/central-common';
import {
    buildFormInput, buildFormSelect, buildFormSubmit, buildFormTextarea,
} from '@vue-layout/form-controls';
import type { ListBodySlotProps, ListItemSlotProps } from '@vue-layout/list-controls';
import { SlotName } from '@vue-layout/list-controls';
import useVuelidate from '@vuelidate/core';
import {
    email, helpers, maxLength, minLength, required,
} from '@vuelidate/validators';
import { BFormCheckbox } from 'bootstrap-vue-next';
import type {
    PropType, VNodeArrayChildren,
} from 'vue';
import {
    computed, defineComponent, nextTick, ref,
} from 'vue';
import { initFormAttributesFromSource } from '../../../utils';
import { buildValidationTranslator } from '../../../composables/ilingo';
import { useAPI } from '#imports';
import { wrapFnWithBusyState } from '../../../core/busy';
import RegistryList from '../registry/RegistryList';

export default defineComponent({
    name: 'StationForm',
    props: {
        entity: {
            type: Object as PropType<Station>,
            default: undefined,
        },
        realmId: {
            type: String,
            default: undefined,
        },
        realmName: {
            type: String,
            default: undefined,
        },
    },
    emits: ['created', 'updated', 'failed', 'robotUpdated'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            name: '',
            public_key: '',
            external_name: '',
            email: '',
            realm_id: '',
            registry_id: '',
            hidden: false,
            ecosystem: '',
        });

        const $v = useVuelidate({
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30),
            },
            realm_id: {
                required,
            },
            ecosystem: {
                required,
            },
            registry_id: {

            },
            external_name: {
                alphaNumHyphenUnderscore: helpers.regex(alphaNumHyphenUnderscoreRegex),
                minLength: minLength(3),
                maxLength: maxLength(64),
            },
            email: {
                minLength: minLength(10),
                maxLength: maxLength(256),
                email,
            },
            public_key: {
                minLength: minLength(10),
                maxLength: maxLength(4096),
            },
        }, form);

        const ecosystems = [
            { id: Ecosystem.DEFAULT, value: 'DEFAULT' },
            { id: Ecosystem.PADME, value: 'PADME' },
        ];

        const isRealmLocked = computed(() => refs.realmId.value ||
                (refs.entity.value && refs.entity.value.realm_id));

        const isHexPublicKey = computed(() => form.public_key && isHex(form.public_key));

        const updatedAt = computed(() => {
            if (!refs.entity.value) {
                return undefined;
            }

            return refs.entity.value.updated_at;
        });

        const registryNode = ref<typeof RegistryList | null>(null);

        const initForm = () => {
            if (refs.entity.value) {
                initFormAttributesFromSource(form, refs.entity.value);
            }

            if (!form.realm_id && refs.realmId.value) {
                form.realm_id = refs.realmId.value;
            }

            if (
                !form.name &&
                (refs.realmId.value || refs.realmName.value)
            ) {
                form.name = (refs.realmName.value || refs.realmId.value) as string;
            }

            nextTick(() => {
                if (registryNode.value) {
                    registryNode.value.load();
                }
            });
        };

        initForm();

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                initForm();
            }
        });

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) return;

            try {
                let station;
                if (refs.entity.value) {
                    station = await useAPI().station.update(refs.entity.value.id, form);

                    emit('updated', station);
                } else {
                    station = await useAPI().station.create(form);

                    emit('created', station);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const toggleFormData = <T extends keyof typeof form>(key: T, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        return () => {
            let realm : VNodeArrayChildren = [];
            if (!isRealmLocked.value) {
                realm = [
                    h(
                        RealmList,
                        {
                            headerTitle: false,
                            headerSearch: false,
                            footerPagination: false,
                        },
                        {
                            [SlotName.BODY]: (props: ListBodySlotProps<Station>) => buildFormSelect({
                                validationTranslator: buildValidationTranslator(),
                                validationResult: $v.value.realm_id,
                                label: true,
                                labelContent: 'Realms',
                                value: form.realm_id,
                                onChange(input) {
                                    form.realm_id = input;
                                },
                                options: props.data.map((item) => ({
                                    id: item.id,
                                    value: item.name,
                                })),
                            }),

                        },
                    ),
                    h('hr'),
                ];
            }

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

            const emailNode = buildFormInput({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.email,
                label: true,
                labelContent: 'E-Mail',
                value: form.email,
                onChange(input) {
                    form.email = input;
                },
            });

            const publicKey = buildFormTextarea({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.public_key,
                label: true,
                labelContent: [
                    'PublicKey',
                    (isHexPublicKey.value ?
                        h('span', { class: 'text-danger font-weight-bold ps-1' }, [
                            'Hex',
                            h('i', { class: 'fa fa-exclamation-triangle ps-1' }),
                        ]) :
                        ''
                    ),
                ],
                value: form.public_key,
                onChange(input) {
                    form.public_key = input;
                },
                props: {
                    rows: 6,
                },
            });

            const hidden = h('div', {
                class: 'form-group mb-1',
            }, [
                h('label', { class: 'mb-2' }, ['Hidden']),
                h(BFormCheckbox, {
                    class: 'pb-2',
                    model: {
                        value: form.hidden,
                        callback(v: boolean) {
                            form.hidden = v;
                        },
                        expression: 'form.hidden',
                    },
                }, [
                    'Hide for proposal & train selection?',
                ]),
            ]);

            const ecosystem = buildFormSelect({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.ecosystem,
                label: true,
                labelContent: 'Ecosystem',
                value: form.ecosystem,
                options: ecosystems,
                onChange(input) {
                    form.ecosystem = input;

                    nextTick(() => {
                        if (registryNode.value) {
                            registryNode.value.load();
                        }
                    });
                },
            });

            let registry : VNodeArrayChildren = [];

            if (form.ecosystem) {
                registry = [
                    h('hr'),
                    h(RegistryList, {
                        ref: registryNode,
                        loadOnSetup: false,
                        query: {
                            filter: {
                                ecosystem: form.ecosystem as Ecosystem,
                            },
                        },
                    }, {
                        [SlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Registry>) => h('button', {
                            disabled: props.busy,
                            class: ['btn btn-xs', {
                                'btn-dark': form.registry_id !== props.data.id,
                                'btn-warning': form.registry_id === props.data.id,
                            }],
                            onClick($event: any) {
                                $event.preventDefault();

                                toggleFormData('registry_id', props.data.id);
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

            const submitNode = buildFormSubmit({
                submit,
                busy: busy.value,
                createText: 'Create',
                updateText: 'Update',
                validationResult: $v.value,
                isEditing: !!refs.entity.value,
            });

            return h('div', [
                h('div', { class: 'row' }, [
                    h('div', {
                        class: 'col',
                    }, [
                        realm,
                        name,
                        h('hr'),
                        externalName,
                        h('hr'),
                        ecosystem,
                        registry,

                    ]),
                    h('div', {
                        class: 'col',
                    }, [
                        hidden,
                        h('hr'),
                        emailNode,
                        h('hr'),
                        publicKey,
                        h('hr'),
                        submitNode,
                    ]),
                ]),
            ]);
        };
    },
});
