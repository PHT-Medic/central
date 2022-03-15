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

import { Proposal, ProposalRisk } from '@personalhealthtrain/central-common';
import {
    ComponentFormData, SlotName, buildFormInput, buildFormSubmit, buildFormTextarea,
} from '@vue-layout/utils';
import { MasterImagePicker } from '../master-image/MasterImagePicker';
import { StationList } from '../station/StationList';
import { AssignmentToggleButton } from '../../AssignmentToggleButton';
import { ProposalStationAssignAction } from '../proposal-station/ProposalStationAssignAction';

import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

type Properties = {
    entity: Proposal
};

export const ProposalForm = Vue.extend<ComponentFormData<Proposal>, any, any, Properties>({
    props: {
        entity: {
            type: Object as PropType<Proposal>,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                title: '',
                requested_data: '',
                master_image_id: '',
                risk: ProposalRisk.MID,
                risk_comment: '',
            },

            busy: false,

            station: {
                selectedIds: [],
                items: [],
                busy: false,
            },

            risks: [
                { id: ProposalRisk.LOW, name: '(Low) Low risk', class: 'btn-success' },
                { id: ProposalRisk.MID, name: '(Mid) Mid risk', class: 'btn-warning' },
                { id: ProposalRisk.HIGH, name: '(High) High risk', class: 'btn-danger' },
            ],
        };
    },
    computed: {
        isEditing() {
            return this.entity && Object.prototype.hasOwnProperty.call(this.entity, 'id');
        },
        masterImageId() {
            return this.isEditing ? this.entity.master_image_id : undefined;
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
            title: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100),
            },
            requested_data: {
                required,
                minLength: minLength(10),
                maxLength: maxLength(2048),
            },
            master_image_id: {
                required,
            },
            risk: {
                required,
            },
            risk_comment: {
                required,
                minLength: minLength(10),
                maxLength: maxLength(2048),
            },
        };

        return {
            form,
        };
    },
    methods: {
        initFromProperties() {
            if (typeof this.entity === 'undefined') return;

            const keys = Object.keys(this.form);
            for (let i = 0; i < keys.length; i++) {
                if (Object.prototype.hasOwnProperty.call(this.entity, keys[i])) {
                    this.form[keys[i]] = this.entity[keys[i]];
                }
            }
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
                    response = await this.$api.proposal.update(this.entity.id, this.form);

                    this.$emit('updated', response);
                } else {
                    response = await this.$api.proposal.create(this.form);

                    for (let i = 0; i < this.station.selectedIds.length; i++) {
                        await this.$api.proposalStation.create({
                            proposal_id: response.id,
                            station_id: this.station.selectedIds[i],
                        });
                    }

                    this.$emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
        async toggleStationIds(id) {
            const index = this.station.selectedIds.indexOf(id);
            if (index === -1) {
                this.station.selectedIds.push(id);
            } else {
                this.station.selectedIds.splice(index, 1);
            }
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

        const title = buildFormInput<Proposal>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Title',
            propName: 'title',
        });

        const masterImagePicker = h(MasterImagePicker, {
            props: {
                entityId: vm.form.master_image_id,
            },
            on: {
                selected(value) {
                    vm.handleMasterImagePicker.call(null, value);
                },
            },
        });

        const risk = h('div', [
            h('label', 'Risk'),
            h('div', { staticClass: 'row  mt-1 mb-2' }, vm.risks.map((value) => h('div', { staticClass: 'col', key: value.id }, [
                h('button', {
                    staticClass: 'btn btn-block',
                    style: {
                        opacity: value.id === vm.form.risk ? 1 : 0.5,
                    },
                    class: {
                        [value.class]: true,
                        'font-weight-bold': value.id === value.risk,
                    },
                    attrs: {
                        type: 'button',
                    },
                    on: {
                        click($event) {
                            $event.preventDefault();

                            vm.toggleFormData.call(null, 'risk', value.id);
                        },
                    },
                }, [
                    value.id,
                ]),
            ]))),
            (!vm.$v.form.risk.required ?
                h('div', { staticClass: 'alert alert-sm alert-warning' }, [
                    'Specify the possible risk for a station in general.',
                ]) :
                h('')
            ),
        ]);

        const riskComment = buildFormTextarea<Proposal>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Risk Comment',
            propName: 'risk_comment',
            attrs: {
                rows: 6,
            },
        });

        const submit = buildFormSubmit<Proposal>(vm, h, {
            updateText: 'Update',
            createText: 'Create',
        });

        const stations = h('div', [
            h(StationList, {
                props: {
                    query: {
                        filter: {
                            hidden: false,
                        },
                    },
                },
                scopedSlots: {
                    [SlotName.HEADER_TITLE]: (props) => h('label', ['Stations']),
                    [SlotName.ITEM_ACTIONS]: (props) => {
                        if (vm.isEditing) {
                            return h(ProposalStationAssignAction, {
                                props: {
                                    stationId: props.item.id,
                                    proposalId: vm.entity.id,
                                    realmId: vm.entity.id,
                                },
                            });
                        }

                        return h(AssignmentToggleButton, {
                            props: {
                                id: props.item.id,
                                ids: vm.station.selectedIds,
                            },
                            on: {
                                toggle() {
                                    vm.toggleStationIds.call(null, props.item.id);
                                },
                            },
                        });
                    },
                },
            }),
            h('div', { staticClass: 'alert alert-dark alert-sm' }, [
                'Chose a arbitrary amount of target stations.',
            ]),
        ]);

        const data = buildFormTextarea<Proposal>(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Data/Parameters',
            propName: 'requested_data',
            attrs: {
                rows: 6,
            },
        });

        return h(
            'div',
            { staticClass: 'row' },
            [
                h(
                    'div',
                    { staticClass: 'col' },
                    [
                        title,
                        h('hr'),
                        masterImagePicker,
                        h('hr'),
                        risk,
                        h('hr'),
                        riskComment,
                    ],
                ),
                h(
                    'div',
                    { staticClass: 'col' },
                    [
                        stations,
                        h('hr'),
                        data,
                        h('hr'),
                        submit,
                    ],
                ),
            ],
        );
    },
});

export default ProposalForm;
