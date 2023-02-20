/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { UserSecret } from '@personalhealthtrain/central-common';
import {
    SecretType,
} from '@personalhealthtrain/central-common';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import type { CreateElement, VNode } from 'vue';
import Vue from 'vue';
import {
    buildFormInput, buildFormSelect, buildFormSubmit, buildFormTextarea,
} from '@vue-layout/utils';

export default Vue.extend({
    name: 'UserSecretForm',
    props: {
        userId: {
            type: String,
            default: undefined,
        },
        entity: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            form: {
                key: '',
                type: '',
                content: '',
            },

            busy: false,

            typeOptions: [
                { id: SecretType.RSA_PUBLIC_KEY, value: 'RSA' },
                { id: SecretType.PAILLIER_PUBLIC_KEY, value: 'Paillier' },
            ],
        };
    },
    validations: {
        form: {
            key: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            content: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(8192),
            },
            type: {
                required,
            },
        },
    },
    computed: {
        isEditing() {
            return this.entity &&
                Object.prototype.hasOwnProperty.call(this.entity, 'id');
        },
    },
    created() {
        this.resetFormData();
    },
    methods: {
        resetFormData() {
            const keys = Object.keys(this.form);
            for (let i = 0; i < keys.length; i++) {
                if (
                    typeof this.entity !== 'undefined' &&
                    this.entity[keys[i]]
                ) {
                    this.form[keys[i]] = this.entity[keys[i]];
                } else {
                    switch (keys[i]) {
                        case 'type':
                            this.form[keys[i]] = SecretType.RSA_PUBLIC_KEY;
                            this.handleTypeChanged(this.form[keys[i]]);
                            break;
                        default:
                            this.form[keys[i]] = '';
                            break;
                    }
                }
            }
        },

        readFile() {
            this.busy = true;

            const file = this.$refs.myFile.files[0];

            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (evt) => {
                let content = evt.target.result;

                if (Buffer.isBuffer(content)) {
                    content = content.toString();
                }

                if (ArrayBuffer.isView(content)) {
                    content = content.toString();
                }

                this.form.content = Buffer.from(content as string, 'utf-8').toString('hex');
                this.busy = false;
                this.$refs.myFile.value = '';
            };
            reader.onerror = () => {
                this.busy = false;
                this.$refs.myFile.value = '';
            };
        },

        async submit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                let response;

                if (this.isEditing) {
                    response = await this.$api.userSecret.update(this.entity.id, { ...this.form });

                    this.$emit('updated', response);
                } else {
                    response = await this.$api.userSecret.create({ ...this.form });

                    this.$emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },

        handleTypeChanged(type) {
            if (
                this.form.key &&
                this.form.key !== SecretType.PAILLIER_PUBLIC_KEY &&
                this.form.key !== SecretType.RSA_PUBLIC_KEY
            ) {
                return;
            }

            this.form.key = type;
        },
    },
    render(h: CreateElement) : VNode {
        const vm = this;
        const type = buildFormSelect<UserSecret>(vm, h, {
            title: 'Type',
            propName: 'type',
            changeCallback(input) {
                vm.form.type = input;
                vm.handleTypeChanged.call(null, input);
            },
            options: vm.typeOptions,
        });

        const key = buildFormInput<UserSecret>(vm, h, {
            title: 'Name',
            propName: 'key',
        });

        const file = h('div', {
            staticClass: 'form-group',
            class: {
                'form-group-error': vm.$v.form.content.$error,
                'form-group-warning': vm.$v.form.content.$invalid &&
                    !vm.$v.form.content.$dirty,
            },
        }, [
            h('label', 'File'),
            h('div', { staticClass: 'custom-file' }, [
                h('label', { staticClass: 'custom-file-label' }, [
                    'Public key file path...',
                ]),
                h('input', {
                    ref: 'myFile',
                    attrs: {
                        type: 'file',
                    },
                    staticClass: 'custom-file-input',
                    on: {
                        change($event) {
                            $event.preventDefault();

                            vm.readFile.call(null);
                        },
                    },
                }),
            ]),
        ]);

        const content = buildFormTextarea(vm, h, {
            title: 'Content',
            propName: 'content',
            attrs: {
                rows: 8,
            },
        });

        const submit = buildFormSubmit(vm, h, {
            createText: 'Create',
            updateText: 'Update',
        });

        return h('div', [
            type,
            h('hr'),
            key,
            h('hr'),
            h('div', { staticClass: 'alert alert-dark alert-sm' }, [
                'A secret can either be specified via',
                h('strong', { staticClass: 'pl-1 pr-1' }, 'file'),
                'upload or by pasting its',
                h('strong', { staticClass: 'pl-1 pr-1' }, 'content'),
                'in the textarea shown below.',
            ]),
            file,
            content,
            h('hr'),
            submit,
        ]);
    },
});
