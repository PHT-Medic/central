/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { UserSecret } from '@personalhealthtrain/central-common';
import {
    SecretType,
    hexToUTF8, isHex,
} from '@personalhealthtrain/central-common';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import {
    buildFormInput, buildFormSelect, buildFormSubmit, buildFormTextarea,
} from '@vue-layout/form-controls';
import { wrapFnWithBusyState } from '../../../core/busy';

export default defineComponent({
    name: 'UserSecretForm',
    props: {
        userId: {
            type: String,
            default: undefined,
        },
        entity: {
            type: Object as PropType<UserSecret>,
        },
    },
    emits: ['created', 'updated', 'failed'],
    setup(props, { emit, expose }) {
        const refs = toRefs(props);
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
                        if (refs.entity.value) {
                            form.content = readContent(refs.entity.value.content);
                        } else {
                            form.content = '';
                        }
                        break;
                    }
                    case 'type': {
                        if (refs.entity.value) {
                            form.type = refs.entity.value.type;
                        } else {
                            form.type = SecretType.RSA_PUBLIC_KEY;
                        }
                        handleTypeChanged(form.type);
                        break;
                    }
                    default: {
                        if (
                            refs.entity.value &&
                            refs.entity.value[key]
                        ) {
                            (form as any)[key] = refs.entity.value[key];
                        } else {
                            (form as any)[key] = '' as any;
                        }
                    }
                }
            }
        };

        expose({
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

            try {
                let response;

                if (refs.entity.value) {
                    response = await useAPI().userSecret.update(refs.entity.value.id, { ...form });

                    emit('updated', response);
                } else {
                    response = await useAPI().userSecret.create({ ...form });

                    emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
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
                    isEditing: !!refs.entity.value,
                    validationResult: $v.value,
                }),
            ]);
        };
    },
});
