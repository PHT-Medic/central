/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    maxLength, minLength, required,
} from 'vuelidate/lib/validators';
import Vue, { CreateElement, PropType, VNode } from 'vue';

import { SettingsOption } from '@personalhealthtrain/central-common';
import {
    ComponentFormData, buildFormInput, buildFormSubmit, buildFormTextarea, initPropertiesFromSource,
} from '@vue-layout/utils';

import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

type Properties = {
    entity: SettingsOption
};

export const ArchitectureForm = Vue.extend<ComponentFormData<SettingsOption>, any, any, Properties>({
    name: 'ArchitectureForm',
    props: {
        entity: {
            type: Object as PropType<SettingsOption>,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                name: '',
                description: '',
            },

            busy: false,
        };
    },
    computed: {
        isEditing() {
            return this.entity &&
                Object.prototype.hasOwnProperty.call(this.entity, 'id');
        },
        updatedAt() {
            return this.isEditing ? this.entity.updated_at : undefined;
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
        const form = {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            description: {
                minLength: minLength(3),
                maxLength: maxLength(512),
            },
        };

        return {
            form,
        };
    },
    methods: {
        initFromProperties() {
            initPropertiesFromSource(this.entity, this.form);
        },
        handleMasterImagePicker(item) {
            if (item) {
                this.form.master_image_id = item.id;
            } else {
                this.form.master_image_id = '';
            }
        },
        async submit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                let response;

                if (this.isEditing) {
                    response = await this.$api.architecture.update(this.entity.id, this.form);

                    this.$emit('updated', response);
                } else {
                    response = await this.$api.architecture.create(this.form);

                    this.$emit('created', response);
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

        const name = buildFormInput<SettingsOption>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Name',
            propName: 'value',
        });

        const description = buildFormTextarea<SettingsOption>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Description',
            propName: 'description',
            attrs: {
                rows: 6,
            },
        });

        const submit = buildFormSubmit<SettingsOption>(vm, h, {
            updateText: 'Update',
            createText: 'Create',
        });

        return h(
            'div',
            [
                name,
                h('hr'),
                description,
                h('hr'),
                submit,
            ],
        );
    },
});

export default ArchitectureForm;
