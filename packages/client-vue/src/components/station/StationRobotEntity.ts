/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityManagerSlotProps } from '@authup/client-vue';
import { RobotEntity } from '@authup/client-vue';
import type { PropType } from 'vue';
import { defineComponent, h, reactive } from 'vue';
import type { Station } from '@personalhealthtrain/central-common';
import {
    Ecosystem,
} from '@personalhealthtrain/central-common';
import type { Robot } from '@authup/core';
import { buildFormInput, buildFormSubmit } from '@vue-layout/form-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength } from '@vuelidate/validators';
import { useValidationTranslator } from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Station>,
            required: true,
        },
    },
    emits: ['failed'],
    setup(props, { emit }) {
        if (props.entity.ecosystem !== Ecosystem.DEFAULT) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-danger' },
                [
                    'The robot creation is only permitted for the default ecosystem.',
                ],
            );
        }

        const form = reactive({
            id: '',
            secret: '',
        });

        const $v = useVuelidate({
            id: {

            },
            secret: {
                minLength: minLength(3),
                maxLength: maxLength(256),
            },
        }, form);

        return () => h(RobotEntity, {
            onFailed: (e) => {
                emit('failed', e);
            },
            where: {
                name: props.entity.id,
                realm_id: props.entity.realm_id,
            },
        }, {
            default: (slotProps: EntityManagerSlotProps<Robot>) => {
                if (!slotProps.entity) {
                    return h(
                        'div',
                        { class: 'alert alert-sm alert-warning' },
                        [
                            'The robot details can not be displayed.',
                        ],
                    );
                }

                const id = buildFormInput({
                    validationTranslator: useValidationTranslator(),
                    validationResult: $v.value.id,
                    label: true,
                    labelContent: 'ID',
                    value: form.id,
                    props: {
                        disabled: true,
                    },
                });

                const secret = buildFormInput({
                    validationTranslator: useValidationTranslator(),
                    validationResult: $v.value.secret,
                    label: true,
                    labelContent: 'Secret',
                    value: form.secret,
                    props: {
                        placeholder: '...',
                    },
                    onChange(value) {
                        form.secret = value;
                    },
                });

                const submitForm = buildFormSubmit({
                    submit: () => slotProps.update(form),
                    busy: slotProps.busy,
                    updateText: 'Update',
                    createText: 'Create',
                    isEditing: !!slotProps.entity,
                });

                return h('div', [
                    id,
                    secret,
                    submitForm,
                ]);
            },
        });
    },
});
