/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { initFormAttributesFromSource } from '@authup/client-vue';
import type { ProposalStation } from '@personalhealthtrain/central-common';
import { ProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import { buildFormInput, buildFormSelect, buildFormSubmit } from '@vue-layout/form-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import { ref } from 'vue';
import type { PropType } from 'vue';
import { buildValidationTranslator } from '../../../composables/ilingo';
import { wrapFnWithBusyState } from '../../../core/busy';

export default defineComponent({
    name: 'ProposalInForm',
    props: {
        entity: {
            type: Object as PropType<ProposalStation>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            comment: '',
            approval_status: '' as ProposalStationApprovalStatus,
        });

        const options = [
            ProposalStationApprovalStatus.APPROVED,
            ProposalStationApprovalStatus.REJECTED,
        ];

        const $v = useVuelidate({
            comment: {
                minLength: minLength(5),
                maxLength: maxLength(2048),
            },
            approval_status: {
                required,
            },
        }, form);

        if (refs.entity.value) {
            initFormAttributesFromSource(form, refs.entity.value);
        }

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) return;

            try {
                const response = await useAPI().proposalStation.update(refs.entity.value.id, form);

                emit('updated', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return () => {
            const comment = buildFormInput({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.comment,
                label: true,
                labelContent: 'Comment',
                value: form.comment,
                onChange(input) {
                    form.comment = input;
                },
                props: {
                    placeholder: 'Write a comment why you want to approve or either reject the proposal...',
                },
            });

            const status = buildFormSelect({
                validationTranslator: buildValidationTranslator(),
                validationResult: $v.value.approval_status,
                label: true,
                labelContent: 'Status',
                value: form.approval_status,
                onChange(input) {
                    form.approval_status = input;
                },
                options: options.map((option) => ({
                    id: option,
                    value: option,
                })),
            });

            const submitNode = buildFormSubmit({
                submit,
                busy: busy.value,
                updateText: 'Update',
                createText: 'Create',
                isEditing: true,
                validationResult: $v.value,
            });

            return h(
                'div',
                [
                    h('div', { class: 'alert alert-sm alert-info' }, [
                        'You have to approve the proposal, so the proposal owner can target you as a station for the train route.',
                    ]),
                    comment,
                    status,
                    h('hr'),
                    submitNode,
                ],
            );
        };
    },
});
