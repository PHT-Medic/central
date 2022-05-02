/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProposalStation, ProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import {
    maxLength, minLength, required,
} from 'vuelidate/lib/validators';
import Vue, { CreateElement, PropType, VNode } from 'vue';
import {
    ComponentFormData,
    buildFormInput,
    buildFormSelect,
    buildFormSubmit,
    initPropertiesFromSource,
} from '@vue-layout/utils';
import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

type Properties = {
    entity: ProposalStation
};

export const ProposalInForm = Vue.extend<ComponentFormData<ProposalStation>, any, any, Properties>({
    props: {
        entity: Object as PropType<ProposalStation>,
    },
    data() {
        return {
            form: {
                comment: '',
                approval_status: '' as ProposalStationApprovalStatus,
            },

            statusOptions: [
                ProposalStationApprovalStatus.APPROVED,
                ProposalStationApprovalStatus.REJECTED,
            ],

            busy: false,
            message: null,
        };
    },
    validations: {
        form: {
            comment: {
                minLength: minLength(5),
                maxLength: maxLength(2048),
            },
            approval_status: {
                required,
            },
        },
    },
    computed: {
        isEditing() {
            return true;
        },
    },
    created() {
        initPropertiesFromSource(this.entity, this.form);
    },
    methods: {
        async submit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                const response = await this.$api.proposalStation.update(this.entity.id, this.form);

                this.$emit('updated', response);
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

        const comment = buildFormInput<ProposalStation>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Comment',
            propName: 'comment',
            attrs: {
                placeholder: 'Write a comment why you want to approve or either reject the proposal...',
            },
        });

        const status = buildFormSelect<ProposalStation>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Status',
            propName: 'approval_status',
            options: vm.statusOptions.map((option) => ({
                id: option,
                value: option,
            })),
        });

        const submit = buildFormSubmit<ProposalStation>(vm, h, {
            updateText: 'Update',
            createText: 'Create',
        });

        return h(
            'div',
            [
                h('div', { staticClass: 'alert alert-sm alert-info' }, [
                    'You have to approve the proposal, so the proposal owner can target you as a station for the train route.',
                ]),
                comment,
                status,
                h('hr'),
                submit,
            ],
        );
    },
});

export default ProposalInForm;
