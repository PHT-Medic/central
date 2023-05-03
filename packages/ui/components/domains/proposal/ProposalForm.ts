/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { buildValidationTranslator, initFormAttributesFromSource } from '@authup/client-vue';
import { buildFormInput, buildFormSubmit, buildFormTextarea } from '@vue-layout/form-controls';
import type { ListItemSlotProps } from '@vue-layout/list-controls';
import { SlotName } from '@vue-layout/list-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import { computed } from 'vue';
import type { PropType } from 'vue';

import type { MasterImage, Proposal, Station } from '@personalhealthtrain/central-common';
import { ProposalRisk } from '@personalhealthtrain/central-common';
import { wrapFnWithBusyState } from '../../../core/busy';
import MasterImagePicker from '../master-image/MasterImagePicker';
import StationList from '../station/StationList';
import { AssignmentToggleButton } from '../../AssignmentToggleButton';
import ProposalStationAssignAction from '../proposal-station/ProposalStationAssignAction';

export default defineComponent({
    name: 'ProposalForm',
    props: {
        entity: {
            type: Object as PropType<Proposal>,
            default: undefined,
        },
    },
    emits: ['created', 'updated', 'failed'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            title: '',
            requested_data: '',
            master_image_id: '',
            risk: ProposalRisk.MID,
            risk_comment: '',
        });

        const $v = useVuelidate({
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
        }, form);

        const stationIds = ref<string[]>([]);

        const risks = [
            { id: ProposalRisk.LOW, name: '(Low) Low risk', class: 'btn-success' },
            { id: ProposalRisk.MID, name: '(Mid) Mid risk', class: 'btn-warning' },
            { id: ProposalRisk.HIGH, name: '(High) High risk', class: 'btn-danger' },
        ];

        const initFromProperties = () => {
            if (!refs.entity.value) return;

            initFormAttributesFromSource(form, refs.entity.value);
        };

        const updatedAt = computed(() => (refs.entity.value ?
            refs.entity.value.updated_at :
            undefined));

        watch(updatedAt, (val, oldValue) => {
            if (val && val !== oldValue) {
                initFromProperties();
            }
        });

        const handleMasterImagePicker = (item: MasterImage) => {
            if (item) {
                form.master_image_id = item.id;
            } else {
                form.master_image_id = '';
            }
        };

        const submit = wrapFnWithBusyState(busy, async () => {
            if (!$v.value.$invalid) return;

            try {
                let response;

                if (refs.entity.value) {
                    response = await useAPI().proposal.update(refs.entity.value.id, form);

                    emit('updated', response);
                } else {
                    response = await useAPI().proposal.create(form);

                    for (let i = 0; i < stationIds.value.length; i++) {
                        await useAPI().proposalStation.create({
                            proposal_id: response.id,
                            station_id: stationIds.value[i],
                        });
                    }

                    emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const toggleStationIds = (id: string) => {
            const index = stationIds.value.indexOf(id);
            if (index === -1) {
                stationIds.value.push(id);
            } else {
                stationIds.value.splice(index, 1);
            }
        };

        const toggleFormData = (key: keyof typeof form, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        const title = buildFormInput({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.title,
            label: true,
            labelContent: 'Title',
            value: form.title,
            onChange(input) {
                form.title = input;
            },
        });

        const masterImagePicker = h(MasterImagePicker, {
            entityId: form.master_image_id,
            onSelected(value: MasterImage) {
                handleMasterImagePicker(value);
            },
        });

        const risk = h('div', [
            h('label', 'Risk'),
            h('div', { class: 'row  mt-1 mb-2' }, risks.map((value) => h('div', { class: 'col', key: value.id }, [
                h('button', {
                    style: {
                        opacity: value.id === form.risk ? 1 : 0.5,
                    },
                    class: ['btn btn-block', {
                        [value.class]: true,
                        'font-weight-bold': value.id === form.risk,
                    }],
                    type: 'button',
                    onClick($event: any) {
                        $event.preventDefault();

                        toggleFormData('risk', value.id);
                    },
                }, [
                    value.id,
                ]),
            ]))),
            (!$v.value.risk.required ?
                h('div', { class: 'alert alert-sm alert-warning' }, [
                    'Specify the possible risk for a station in general.',
                ]) :
                h('')
            ),
        ]);

        const riskComment = buildFormTextarea({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.name,
            label: true,
            labelContent: 'Risk Comment',
            value: form.risk_comment,
            onChange(input) {
                form.risk_comment = input;
            },
            props: {
                rows: 6,
            },
        });

        const submitNode = buildFormSubmit({
            submit,
            busy,
            updateText: 'Update',
            createText: 'Create',
        });

        const stationsNode = h('div', [
            h(StationList, {
                query: {
                    filter: {
                        hidden: false,
                    },
                },
                headerTitle: {
                    content: h('label', 'Stations'),
                },
            }, {
                [SlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Station>) => {
                    if (refs.entity.value) {
                        return h(ProposalStationAssignAction, {
                            stationId: props.item.id,
                            proposalId: refs.entity.value.id,
                            realmId: refs.entity.value.id,
                        });
                    }

                    return h(AssignmentToggleButton, {
                        id: props.item.id,
                        ids: stationIds.value,
                        onToggle() {
                            toggleStationIds(props.item.id);
                        },
                    });
                },
            }),
            h('div', { class: 'alert alert-dark alert-sm' }, [
                'Chose a arbitrary amount of target stations.',
            ]),
        ]);

        const data = buildFormTextarea({
            validationTranslator: buildValidationTranslator(),
            validationResult: $v.value.requested_data,
            label: true,
            labelContent: 'Data/Parameters',
            value: form.requested_data,
            onChange(input) {
                form.requested_data = input;
            },
            props: {
                rows: 6,
            },
        });

        return h(
            'div',
            { class: 'row' },
            [
                h(
                    'div',
                    { class: 'col' },
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
                    { class: 'col' },
                    [
                        stationsNode,
                        h('hr'),
                        data,
                        h('hr'),
                        submitNode,
                    ],
                ),
            ],
        );
    },
});
