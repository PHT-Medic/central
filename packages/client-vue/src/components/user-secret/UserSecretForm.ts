/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { UserSecret } from '@personalhealthtrain/central-common';
import {
    DomainType,
    SecretType, hexToUTF8, isHex,
} from '@personalhealthtrain/central-common';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import type { PropType } from 'vue';
import {
    defineComponent, h, onMounted, reactive, ref,
} from 'vue';
import {
    buildFormInput, buildFormSelect, buildFormSubmit, buildFormTextarea,
} from '@vue-layout/form-controls';
import { createEntityManager, defineEntityManagerEvents, wrapFnWithBusyState } from '../../core';

export default defineComponent({
    props: {
        userId: {
            type: String,
            default: undefined,
        },
        entity: {
            type: Object as PropType<UserSecret>,
        },
    },
    emits: defineEntityManagerEvents<UserSecret>(),
    setup(props, setup) {
        const fileInput = ref<null | Record<string, any>>(null);

        const typeOptions = [
            { id: SecretType.RSA_PUBLIC_KEY, value: 'RSA' },
            { id: SecretType.PAILLIER_PUBLIC_KEY, value: 'Paillier' },
        ];
        const busy = ref(false);
        const form = reactive({
            key: '',
            type: SecretType.RSA_PUBLIC_KEY,
            content: '',
        });

        const $v = useVuelidate({
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
        }, form);

        const manager = createEntityManager({
            type: `${DomainType.USER_SECRET}`,
            setup,
            props,
        });

        const handleTypeChanged = (type: SecretType) => {
            if (
                form.key &&
                form.key !== SecretType.PAILLIER_PUBLIC_KEY &&
                form.key !== SecretType.RSA_PUBLIC_KEY
            ) {
                return;
            }

            form.key = type;
        };

        const readContent = (input: string) => (
            isHex(input) ?
                hexToUTF8(input) :
                input
        );

        const resetFormData = () => {
            const keys = Object.keys(form) as (keyof UserSecret)[];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                switch (key) {
                    case 'content': {
                        if (manager.entity.value) {
                            form.content = readContent(manager.entity.value.content);
                        } else {
                            form.content = '';
                        }
                        break;
                    }
                    case 'type': {
                        if (manager.entity.value) {
                            form.type = manager.entity.value.type;
                        } else {
                            form.type = SecretType.RSA_PUBLIC_KEY;
                        }
                        handleTypeChanged(form.type);
                        break;
                    }
                    default: {
                        if (
                            manager.entity.value &&
                            manager.entity.value[key]
                        ) {
                            (form as any)[key] = manager.entity.value[key];
                        } else {
                            (form as any)[key] = '' as any;
                        }
                    }
                }
            }
        };

        setup.expose({
            resetFormData,
        });

        onMounted(() => resetFormData());

        const readFile = () => {
            busy.value = true;

            if (!fileInput.value) {
                return;
            }

            const file = fileInput.value.files[0];

            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (evt) => {
                if (!evt.target) {
                    return;
                }

                const content = evt.target.result;
                if (!content) {
                    form.content = '';
                } else if (typeof content === 'string') {
                    form.content = readContent(content);
                } else {
                    const decoder = new TextDecoder();
                    form.content = readContent(decoder.decode(content));
                }

                busy.value = false;

                if (fileInput.value) {
                    fileInput.value.value = '';
                }
            };
            reader.onerror = () => {
                busy.value = false;
                if (fileInput.value) {
                    fileInput.value.value = '';
                }
            };
        };

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) {
                return;
            }

            await manager.createOrUpdate(form);
        });

        return () => {
            const type = buildFormSelect({
                label: true,
                labelContent: 'Type',
                value: form.type,
                onChange(input: SecretType) {
                    form.type = input;
                    handleTypeChanged(input);
                },
                options: typeOptions,
            });

            const key = buildFormInput({
                label: true,
                labelContent: 'Name',
                value: form.key,
                onChange(input: string) {
                    form.key = input;
                },
            });

            const file = h('div', {
                class: ['form-group', {
                    'form-group-error': $v.value.content.$error,
                    'form-group-warning': $v.value.content.$invalid &&
                        !$v.value.content.$dirty,
                }],
            }, [
                h('label', 'File'),
                h('div', { class: 'input-group' }, [
                    h('input', {
                        ref: fileInput,
                        type: 'file',
                        class: 'form-control',
                        placeholder: 'Public key file path...',
                        onChange($event: any) {
                            $event.preventDefault();

                            readFile();
                        },
                    }),
                ]),
            ]);

            const content = buildFormTextarea({
                label: true,
                labelContent: 'Content',
                value: form.content,
                onChange(input) {
                    form.content = input;
                },
                props: {
                    rows: 8,
                },
            });

            return h('div', [
                type,
                h('hr'),
                key,
                h('hr'),
                h('div', { class: 'alert alert-dark alert-sm' }, [
                    'A secret can either be specified via',
                    h('strong', { class: 'ps-1 pe-1' }, 'file'),
                    'upload or by pasting its',
                    h('strong', { class: 'ps-1 pe-1' }, 'content'),
                    'in the textarea shown below.',
                ]),
                file,
                content,
                h('hr'),
                buildFormSubmit({
                    createText: 'Create',
                    updateText: 'Update',
                    submit,
                    busy: busy.value,
                    isEditing: !!manager.entity.value,
                    validationResult: $v.value,
                }),
            ]);
        };
    },
});
