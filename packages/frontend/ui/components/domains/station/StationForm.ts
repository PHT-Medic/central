/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Station,
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
    CreateElement, PropType, VNode, VNodeChildren, VNodeData,
} from 'vue';
import { buildVuelidateTranslator } from '../../../config/ilingo/utils';
import StationRegistryManagement from './StationRegistryManagement';
import StationSecretStorageManagement from './StationSecretStorageManagement';

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
                hidden: false,
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
            return this.entity ?
                this.entity.updated_at :
                undefined;
        },
    },
    watch: {
        updatedAt(val, oldVal) {
            if (val !== oldVal) {
                this.initFromProperties();
            }
        },
    },
    created() {
        Promise.resolve()
            .then(this.initFromProperties);
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
                !this.form.name &&
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
        generateSecureId() {
            this.form.secure_id = createNanoID();
        },
        resetSecureId() {
            this.form.secure_id = this.entity.secure_id;
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

        const hidden = h('div', {
            staticClass: 'form-group mb-1',
        }, [
            h('b-form-checkbox', {
                model: {
                    value: vm.form.hidden,
                    callback(v: boolean) {
                        vm.form.hidden = v;
                    },
                    expression: 'form.hidden',
                },
            } as VNodeData, [
                'Hidden?',
            ]),
            h('div', {
                staticClass: 'alert alert-sm alert-info mt-1',
            }, [
                'If enabled the station can not be target during proposal & train creation.',
            ]),
        ]);

        const submit = buildFormSubmit(vm, h, {
            updateText: 'Update',
            createText: 'Create',
        });

        let editingElements : VNodeChildren = [];

        if (this.isEditing) {
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
                        h(StationSecretStorageManagement, {
                            props: {
                                entity: vm.entity,
                            },
                            on: {
                                updated(entity) {
                                    vm.handleUpdated.call(null, entity);
                                },
                            },
                        }),
                    ]),
                    h('div', { staticClass: 'col' }, [
                        h(StationRegistryManagement, {
                            props: {
                                entity: vm.entity,
                            },
                            on: {
                                updated(entity) {
                                    vm.handleUpdated.call(null, entity);
                                },
                            },
                        }),
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
                    hidden,
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
