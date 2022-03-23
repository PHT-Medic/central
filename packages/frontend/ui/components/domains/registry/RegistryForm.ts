/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem, Registry } from '@personalhealthtrain/central-common';
import Vue, {
    CreateElement, PropType, VNode, VNodeChildren,
} from 'vue';
import {
    ComponentFormData, SlotName, buildFormInput, buildFormSelect, buildFormSubmit, initPropertiesFromSource,
} from '@vue-layout/utils';
import {
    maxLength, minLength, required, url,
} from 'vuelidate/lib/validators';
import { RealmList } from '@authelion/vue';
import { Realm } from '@authelion/common';
import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

type Properties = {
    entity: Registry,
    realmId?: Realm['id']
};

export const RegistryForm = Vue.extend<ComponentFormData<Registry>, any, any, Properties>({
    props: {
        entity: {
            type: Object as PropType<Registry>,
            default: undefined,
        },
        realmId: {
            type: String as PropType<Realm['id']>,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                name: '',
                address: '',
                ecosystem: Ecosystem.DEFAULT,
                account_name: '',
                account_secret: '',
                realm_id: '',
            },

            busy: false,

            ecosystems: [
                { id: Ecosystem.DEFAULT, value: 'DEFAULT' },
                { id: Ecosystem.PADME, value: 'PADME' },
            ],
        };
    },
    computed: {
        isEditing() {
            return this.entity &&
                Object.prototype.hasOwnProperty.call(this.entity, 'id');
        },
        isRealmLocked() {
            return this.realmId;
        },
        updatedAt() {
            return this.entity ? this.entity.updated_at : undefined;
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
        this.initFromProperties();
    },
    validations() {
        return {
            form: {
                name: {
                    required,
                    minLength: minLength(3),
                    maxLength: maxLength(128),
                },
                address: {
                    required,
                    url,
                    maxLength: maxLength(512),
                },
                ecosystem: {
                    required,
                },
                account_name: {
                    inLength: minLength(3),
                    maxLength: maxLength(256),
                },
                account_secret: {
                    minLength: minLength(3),
                    maxLength: maxLength(256),
                },
                realm_id: {
                    required,
                },
            },
        };
    },
    methods: {
        initFromProperties() {
            if (this.realmId) {
                this.form.realm_id = this.realmId;
            }

            if (typeof this.entity === 'undefined') return;

            initPropertiesFromSource(this.entity, this.form);
        },
        async submit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                let response;

                if (this.isEditing) {
                    response = await this.$api.registry.update(this.entity.id, this.form);

                    this.$emit('updated', response);
                } else {
                    response = await this.$api.registry.create(this.form);

                    this.$emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
        async toggleFormData(key, id) {
            if (this.form[key] === id) {
                this.form[key] = null;
            } else {
                this.form[key] = id;
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        const name = buildFormInput<Registry>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Name',
            propName: 'name',
        });

        const address = buildFormInput<Registry>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Address',
            propName: 'address',
        });

        const ecosystem = buildFormSelect<Registry>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Ecosystem',
            propName: 'ecosystem',
            options: vm.ecosystems,
        });

        const accountName = buildFormInput<Registry>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Account-Name',
            propName: 'account_name',
        });

        const accountSecret = buildFormInput<Registry>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Account-Secret',
            propName: 'account_secret',
        });

        let realm : VNodeChildren = [];

        if (!vm.isRealmLocked) {
            realm = [
                h('hr'),
                h(RealmList, {
                    scopedSlots: {
                        [SlotName.ITEM_ACTIONS]: (props) => h('button', {
                            attrs: {
                                disabled: props.busy,
                            },
                            class: {
                                'btn-dark': vm.form.realm_id !== props.item.id,
                                'btn-warning': vm.form.realm_id === props.item.id,
                            },
                            staticClass: 'btn btn-xs',
                            on: {
                                click($event) {
                                    $event.preventDefault();

                                    vm.toggleFormData.call(null, 'realm_id', props.item.id);
                                },
                            },
                        }, [
                            h('i', {
                                class: {
                                    'fa fa-plus': vm.form.realm_id !== props.item.id,
                                    'fa fa-minus': vm.form.realm_id === props.item.id,
                                },
                            }),
                        ]),
                    },
                }),
            ];
        }

        const submit = buildFormSubmit(vm, h, {
            createText: 'Create',
            updateText: 'Update',
        });

        return h('form', {
            on: {
                submit($event) {
                    $event.preventDefault();
                },
            },
        }, [
            h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col' }, [
                    h('h6', [
                        h('i', { staticClass: 'fas fa-infinity pr-1' }),
                        'General',
                    ]),
                    name,
                    h('hr'),
                    address,
                    h('hr'),
                    ecosystem,
                ]),
                h('div', { staticClass: 'col' }, [
                    h('h6', [
                        h('i', { staticClass: 'fas fa-robot pr-1' }),
                        'Robot',
                    ]),
                    accountName,
                    accountSecret,
                ]),
            ]),
            realm,
            h('hr'),
            submit,
        ]);
    },
});
