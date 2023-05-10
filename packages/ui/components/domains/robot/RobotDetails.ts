/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildValidationTranslator, initFormAttributesFromSource } from '@authup/client-vue';
import type { Robot } from '@authup/core';
import { buildFormInput, buildFormSubmit } from '@vue-layout/form-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength } from '@vuelidate/validators';
import type { FiltersBuildInput } from 'rapiq';
import { merge } from 'smob';
import type { PropType } from 'vue';
import { wrapFnWithBusyState } from '../../../core/busy';

export default defineComponent({
    name: 'RobotDetails',
    props: {
        where: {
            type: Object as PropType<FiltersBuildInput<Robot>>,
            required: true,
        },
    },
    emits: ['failed', 'resolved', 'updated'],
    async setup(props, { emit }) {
        const busy = ref(false);

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

        const entity = ref<null | Robot>(null);

        await wrapFnWithBusyState(busy, async () => {
            try {
                const { data } = await useAuthupAPI().robot.getMany({
                    filter: props.where,
                    page: {
                        limit: 1,
                    },
                });

                if (data.length === 1) {
                    // eslint-disable-next-line prefer-destructuring
                    entity.value = data[0];

                    initFormAttributesFromSource(form, entity.value);

                    emit('resolved', entity.value);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        })();

        const handleUpdated = (data: Robot) => {
            if (entity.value) {
                entity.value = merge({}, data, entity.value);
                emit('updated', entity.value);
                return;
            }

            entity.value = data;

            emit('updated', entity.value);
        };

        const submit = wrapFnWithBusyState(busy, async () => {
            if (!entity.value) {
                return;
            }

            try {
                const response = await useAuthupAPI().robot.update(entity.value.id, form);

                handleUpdated(response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        if (!entity.value) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-warning' },
                [
                    'The robot details can not be displayed.',
                ],
            );
        }

        const id = buildFormInput({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.id,
            label: true,
            labelContent: 'ID',
            value: form.id,
            props: {
                disabled: true,
            },
        });

        const secret = buildFormInput({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.secret,
            label: true,
            labelContent: 'ID',
            value: form.secret,
            onChange(value) {
                form.secret = value;
            },
        });

        const submitForm = buildFormSubmit({
            submit,
            busy,
            updateText: 'Update',
            createText: 'Create',
        });

        return () => h('div', [
            id,
            secret,
            submitForm,
        ]);
    },
});
