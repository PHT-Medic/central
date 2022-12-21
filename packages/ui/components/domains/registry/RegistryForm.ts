/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem, Registry } from '@personalhealthtrain/central-common';
import Vue, {
    CreateElement, PropType, VNode,
} from 'vue';
import {
    ComponentFormData, buildFormInput, buildFormSelect, buildFormSubmit, initPropertiesFromSource,
} from '@vue-layout/utils';
import {
    maxLength, minLength, required,
} from 'vuelidate/lib/validators';
import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

type Properties = {
    entity: Registry
};

export const RegistryForm = Vue.extend<ComponentFormData<Registry>, any, any, Properties>({
    props: {
        entity: {
            type: Object as PropType<Registry>,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                name: '',
                host: '',
                ecosystem: Ecosystem.DEFAULT,
                account_name: '',
                account_secret: '',
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
                host: {
                    required,
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
            },
        };
    },
    methods: {
        initFromProperties() {
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

        const host = buildFormInput<Registry>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Host',
            propName: 'host',
            attrs: {
                placeholder: 'e.g. ghcr.io',
            },
        });

        const ecosystem = buildFormSelect<Registry>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Ecosystem',
            propName: 'ecosystem',
            options: vm.ecosystems,
            attrs: {
                disabled: vm.isEditing,
            },
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
                    host,
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
            h('hr'),
            h(
                'div',
                { staticClass: 'alert alert-warning alert-danger' },
                [
                    'It is only possible to register harbor registries > v2.3.0',
                ],
            ),
            h('hr'),
            ecosystem,
            h('hr'),
            submit,
        ]);
    },
});
