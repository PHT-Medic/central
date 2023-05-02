/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildValidationTranslator, initFormAttributesFromSource } from '@authup/client-vue';
import type { Registry } from '@personalhealthtrain/central-common';
import { Ecosystem } from '@personalhealthtrain/central-common';
import { buildFormInput, buildFormSelect, buildFormSubmit } from '@vue-layout/form-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import type {
    PropType,
} from 'vue';
import { wrapFnWithBusyState } from '../../../core/busy';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Registry>,
            default: undefined,
        },
    },
    emits: ['updated', 'created', 'failed'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            name: '',
            host: '',
            ecosystem: Ecosystem.DEFAULT,
            account_name: '',
            account_secret: '',
        });

        const $v = useVuelidate({
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
        }, form);

        const ecosystems = [
            { id: Ecosystem.DEFAULT, value: 'DEFAULT' },
            { id: Ecosystem.PADME, value: 'PADME' },
        ];

        const updatedAt = computed(() => {
            if (!refs.entity.value) {
                return undefined;
            }

            return refs.entity.value.updated_at;
        });

        const initForm = () => {
            if (!refs.entity.value) {
                return;
            }

            initFormAttributesFromSource(form, refs.entity.value);
        };

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                initForm();
            }
        });

        initForm();

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) {
                return;
            }

            try {
                let response;

                if (refs.entity.value) {
                    response = await useAPI().registry.update(refs.entity.value.id, form);

                    emit('updated', response);
                } else {
                    response = await useAPI().registry.create(form);

                    emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

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

        const host = buildFormInput({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.host,
            label: true,
            labelContent: 'Host',
            value: form.host,
            onChange(input) {
                form.host = input;
            },
            props: {
                placeholder: 'e.g. ghcr.io',
            },
        });

        const ecosystem = buildFormSelect({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.ecosystem,
            label: true,
            labelContent: 'Ecosystem',
            value: form.ecosystem,
            onChange(input) {
                form.ecosystem = input;
            },
            options: ecosystems,
            props: {
                disabled: !!refs.entity.value,
            },
        });

        const accountName = buildFormInput({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.account_name,
            label: true,
            labelContent: 'Account Name',
            value: form.account_name,
            onChange(input) {
                form.account_name = input;
            },
        });

        const accountSecret = buildFormInput({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.account_secret,
            label: true,
            labelContent: 'Account Secret',
            value: form.account_secret,
            onChange(input) {
                form.account_secret = input;
            },
        });

        const submitNode = buildFormSubmit({
            submit,
            busy,
            createText: 'Create',
            updateText: 'Update',
        });

        return h('form', {
            onSubmit($event: any) {
                $event.preventDefault();
            },
        }, [
            h('div', { class: 'row' }, [
                h('div', { class: 'col' }, [
                    h('h6', [
                        h('i', { class: 'fas fa-infinity pr-1' }),
                        'General',
                    ]),
                    name,
                    host,
                ]),
                h('div', { class: 'col' }, [
                    h('h6', [
                        h('i', { class: 'fas fa-robot pr-1' }),
                        'Robot',
                    ]),
                    accountName,
                    accountSecret,
                ]),
            ]),
            h('hr'),
            h(
                'div',
                { class: 'alert alert-warning alert-danger' },
                [
                    'It is only possible to register harbor registries > v2.3.0',
                ],
            ),
            h('hr'),
            ecosystem,
            h('hr'),
            submitNode,
        ]);
    },
});
