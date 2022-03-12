/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    RegistryCommand,
    SecretStorageCommand,
    Station,
    buildRegistryStationProjectName,
    buildStationSecretStorageKey,
    createNanoID,
    isHex,
} from '@personalhealthtrain/central-common';
import { RealmList } from '@authelion/vue';
import {
    email, helpers, maxLength, minLength, required,
} from 'vuelidate/lib/validators';
import {
    SlotName, buildFormInput, buildFormSelect, buildFormSubmit, buildFormTextarea, initPropertiesFromSource,
} from '@vue-layout/utils';
import Vue, {
    CreateElement, PropType, VNode, VNodeChildren,
} from 'vue';
import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

const alphaNum = helpers.regex('alphaNum', /^[a-z0-9]*$/);

export const StationForm = Vue.extend({
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
    data() {
        return {
            form: {
                name: '',
                public_key: '',
                email: '',
                realm_id: '',
                secure_id: '',
            },

            busy: false,
        };
    },
    validations: {
        form: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30),
            },
            realm_id: {
                required,
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
            secure_id: {
                required,
                alphaNum,
                minLength: minLength(1),
                maxLength: maxLength(100),
            },
        },
    },
    computed: {
        isEditing() {
            return this.entity &&
                Object.prototype.hasOwnProperty.call(this.entity, 'id');
        },
        isRealmLocked() {
            return this.realmId || (this.entity && this.entity.realm_id);
        },
        isHexPublicKey() {
            return this.form.public_key && isHex(this.form.public_key);
        },
        hasSecureIdChanged() {
            if (typeof this.entity?.secure_id === 'undefined') {
                return false;
            }

            return this.entity.secure_id !== this.form.secure_id;
        },

        updatedAt() {
            return this.isEditing ? this.entity.updated_at : undefined;
        },

        pathName() {
            return this.form.name ?
                buildStationSecretStorageKey(this.entity.secure_id) :
                '';
        },
        projectName() {
            return this.form.name ?
                buildRegistryStationProjectName(this.entity.secure_id) :
                '';
        },
    },
    watch: {
        updatedAt(val, oldVal) {
            if (val && val !== oldVal) {
                this.initFromProperties();
            }
        },
    },
    created() {
        Promise.resolve()
            .then(this.initFromProperties)
            .then(this.loadRealms);
    },
    methods: {
        initFromProperties() {
            initPropertiesFromSource(this.entity, this.form);

            if (
                !this.form.realm_id &&
                this.realmId
            ) {
                this.form.realm_id = this.realmId;
            }

            if (
                this.form.name &&
                (this.realmId || this.realmName)
            ) {
                this.form.name = this.realmName || this.realmId;
            }

            if (!this.form.secure_id) {
                this.form.secure_id = createNanoID();
            }
        },
        async submit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                let station;
                if (this.isEditing) {
                    station = await this.$api.station.update(this.entity.id, this.form);

                    this.$emit('updated', station);
                } else {
                    station = await this.$api.station.create(this.form);

                    this.$emit('created', station);
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
        async drop() {
            if (this.busy || !this.isEditing) {
                return;
            }

            this.busy = true;

            try {
                const entity = await this.$api.station.delete(this.entity.id);

                this.$emit('deleted', entity);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed');
                }
            }

            this.busy = false;
        },

        generateSecureId() {
            this.form.secure_id = createNanoID();
        },
        resetSecureId() {
            this.form.secure_id = this.entity.secure_id;
        },

        async runSecretStorageEngineKeySave() {
            await this.runSecretStorageCommand(SecretStorageCommand.ENGINE_KEY_SAVE);
        },
        async runSecretStorageEngineKeyDelete() {
            await this.runSecretStorageCommand(SecretStorageCommand.ENGINE_KEY_DROP);
        },
        async runSecretStorageCommand(action) {
            if (this.busy || !this.isEditing) return;

            this.busy = true;

            try {
                const station = await this.$api.service.runSecretStorageCommand(action, {
                    name: buildStationSecretStorageKey(this.entity.id),
                });

                this.$emit('updated', station);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
        async runRegistryProjectCreate() {
            await this.runRegistryCommand(RegistryCommand.STATION_SAVE);
        },
        async runRegistryProjectDelete() {
            await this.runRegistryCommand(RegistryCommand.STATION_DELETE);
        },
        async runRegistryCommand(command) {
            if (this.busy || !this.isEditing) return;

            this.busy = true;

            try {
                await this.$api.service.runRegistryCommand(command, {
                    id: this.entity.id,
                });

                // eslint-disable-next-line default-case
                switch (command) {
                    case RegistryCommand.STATION_DELETE:
                        this.$emit('updated', {
                            registry_project_id: null,
                            registry_project_account_id: null,
                            registry_project_account_name: null,
                            registry_project_account_token: null,
                            registry_project_webhook_exists: null,
                        });
                        break;
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        let realm = [];
        if (
            !vm.isRealmLocked &&
            vm.canManage
        ) {
            realm = [
                h(RealmList, {
                    props: {
                        withHeader: false,
                        withPagination: false,
                    },
                    scopedSlots: {
                        [SlotName.ITEMS]: (props) => buildFormSelect<Station>(vm, h, {
                            validationTranslator: buildVuelidateTranslator(vm.$ilingo),
                            title: 'Realms',
                            propName: 'realm_id',
                            options: props.items.map((item) => ({
                                id: item.id,
                                name: item.name,
                            })),
                        }),
                    },
                }),
                h('hr'),
            ];
        }

        const name = buildFormInput<Station>(vm, h, {
            validationTranslator: buildVuelidateTranslator(vm.$ilingo),
            title: 'Name',
            propName: 'name',
        });

        const secureId = buildFormInput<Station>(vm, h, {
            validationTranslator: buildVuelidateTranslator(vm.$ilingo),
            title: 'Secure ID',
            propName: 'secure_id',
        });

        const secureIdHint = h('div', {
            staticClass: 'alert alert-sm',
            class: {
                'alert-danger': vm.hasSecureIdChanged,
                'alert-info': !vm.hasSecureIdChanged,
            },
        }, [
            h('div', { staticClass: 'mb-1' }, [
                (vm.hasSecureIdChanged ?
                    'If you change the Secure ID, a new representation will be created in the Registry & Secret-Storage.' :
                    'If you don\'t want to chose a secure identifier by your own, you can generate one.'
                ),
            ]),
            h('button', {
                class: 'btn btn-xs btn-dark',
                attrs: {
                    type: 'button',
                },
                on: {
                    click($event) {
                        $event.preventDefault();

                        vm.generateSecureId.call(null);
                    },
                },
            }, [
                h('i', { staticClass: 'fa fa-wrench pr-1' }),
                'Generate',
            ]),
            h('button', {
                class: 'btn btn-xs btn-dark ml-1',
                attrs: {
                    type: 'button',
                    disabled: !vm.hasSecureIdChanged,
                },
                on: {
                    click($event) {
                        $event.preventDefault();

                        vm.resetSecureId.call(null);
                    },
                },
            }, [
                h('i', { staticClass: 'fa fa-undo pr-1' }),
                'Reset',
            ]),
        ]);

        const email = buildFormInput<Station>(vm, h, {
            validationTranslator: buildVuelidateTranslator(vm.$ilingo),
            title: 'E-Mail',
            propName: 'email',
        });

        const publicKey = buildFormTextarea<Station>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: [
                'PublicKey',
                (vm.isHexPublicKey ?
                    h('span', { staticClass: 'text-danger font-weight-bold pl-1' }, [
                        'Hex',
                        h('i', { staticClass: 'fa fa-exclamation-triangle pl-1' }),
                    ]) :
                    ''
                ),
            ],
            propName: 'public_key',
            attrs: {
                rows: 6,
            },
        });

        const submit = buildFormSubmit(vm, h, {
            updateText: 'Update',
            createText: 'Create',
        });

        let editingElements : VNodeChildren = [];

        if (this.isEditing) {
            const secretStorageElements = [
                h('h6', [
                    h('i', { staticClass: 'fa fa-key pr-1' }),
                    'Secret Storage',
                ]),
                h('p', { staticClass: 'mb-2' }, [
                    'To keep the data between the secret key storage engine and the ui in sync, you can',
                    ' ',
                    'either pull existing secrets from the storage engine or push local secrets against it.',
                ]),
                h('p', [
                    h('strong', { staticClass: 'pr-1' }, 'Path:'),
                    vm.pathName,
                ]),
                h('div', { staticClass: 'd-flex flex-row' }, [
                    h('div', [
                        h('button', {
                            class: 'btn btn-xs btn-primary',
                            attrs: {
                                disabled: vm.busy,
                                type: 'button',
                            },
                            on: {
                                click($event) {
                                    $event.preventDefault();

                                    vm.runSecretStorageEngineKeySave.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa fa-save pr-1' }),
                            'Save',
                        ]),
                    ]),
                    h('div', { staticClass: 'ml-auto' }, [
                        h('button', {
                            class: 'btn btn-xs btn-danger',
                            attrs: {
                                disabled: vm.busy,
                                type: 'button',
                            },
                            on: {
                                click($event) {
                                    $event.preventDefault();

                                    vm.runSecretStorageEngineKeyDelete.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa fa-trash pr-1' }),
                            'Delete',
                        ]),
                    ]),
                ]),
            ];

            const robotCredentials = [];

            if (vm.entity.registry_project_account_name) {
                robotCredentials.push(h('div', [
                    vm.entity.registry_project_account_name,
                ]));
            }

            if (vm.entity.registry_project_account_token) {
                robotCredentials.push(h('div', [
                    vm.entity.registry_project_account_token,
                ]));
            }

            const registryElements = [
                h('h6', [
                    h('i', { staticClass: 'fa fa-folder-open pr-1' }),
                    'Registry',
                ]),
                h('p', { staticClass: 'mb-2' }, [
                    'To keep the data between the registry and the ui in sync, you can pull all available information about the',
                    ' ',
                    'project, webhook, robot-account,... of a station or create them.',
                ]),
                h('div', {
                    staticClass: 'mb-2 d-flex flex-column',
                }, [
                    h('div', [
                        h('strong', { staticClass: 'pr-1' }, 'Namespace:'),
                        vm.projectName,
                        h('i', {
                            staticClass: 'pl-1',
                            class: {
                                'fa fa-check text-success': vm.entity.registry_project_id,
                                'fa fa-times text-danger': !vm.entity.registry_project_id,
                            },
                        }),
                    ]),

                    h('div', [
                        h('strong', { staticClass: 'pr-1' }, 'Webhook:'),
                        h('i', {
                            class: {
                                'fa fa-check text-success': vm.entity.registry_project_webhook_exists,
                                'fa fa-times text-danger': !vm.entity.registry_project_webhook_exists,
                            },
                        }),
                    ]),

                    h('div', [
                        h('strong', { staticClass: 'pr-1' }, 'Robot:'),
                        h('div', { staticClass: 'd-flex flex-column' }, [
                            h('div', [
                                h('i', {
                                    class: {
                                        'fa fa-check text-success': vm.entity.registry_project_account_id,
                                        'fa fa-times text-danger': !vm.entity.registry_project_account_id,
                                    },
                                }),
                            ]),
                            robotCredentials,
                        ]),
                    ]),
                ]),

                h('div', { staticClass: 'd-flex flex-row' }, [
                    h('div', [
                        h('button', {
                            class: 'btn btn-xs btn-primary',
                            attrs: {
                                disabled: vm.busy,
                                type: 'button',
                            },
                            on: {
                                click($event) {
                                    $event.preventDefault();

                                    vm.runRegistryProjectCreate.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa fa-save pr-1' }),
                            'Save',
                        ]),
                    ]),
                    h('div', { staticClass: 'ml-auto' }, [
                        h('button', {
                            class: 'btn btn-xs btn-danger',
                            attrs: {
                                disabled: vm.busy,
                                type: 'button',
                            },
                            on: {
                                click($event) {
                                    $event.preventDefault();

                                    vm.runRegistryProjectDelete.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa fa-trash pr-1' }),
                            'Delete',
                        ]),
                    ]),
                ]),
            ];

            editingElements = [
                h('hr'),
                h('div', { staticClass: 'alert alert-warning alert-sm' }, [
                    'The tasks for the',
                    h('strong', { staticClass: 'pl-1 pr-1' }, 'secret-storage'),
                    'and',
                    h('strong', { staticClass: 'pl-1 pr-1' }, 'registry'),
                    'are performed asynchronously and therefore might take a while, till the view will be updated.',
                ]),
                h('div', { staticClass: 'row' }, [
                    h('div', { staticClass: 'col' }, [
                        secretStorageElements,
                    ]),
                    h('div', { staticClass: 'col' }, [
                        registryElements,
                    ]),
                ]),
            ];
        }

        return h('div', [
            h('div', { staticClass: 'row' }, [
                h('div', {
                    staticClass: 'col',
                }, [
                    realm,
                    name,
                    h('hr'),
                    email,
                    h('hr'),
                    submit,
                ]),
                h('div', {
                    staticClass: 'col',
                }, [
                    secureId,
                    secureIdHint,
                    h('hr'),
                    publicKey,
                ]),
            ]),
            ...editingElements,
        ]);
    },
});

export default StationForm;
