<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { MasterImage, Train, TrainStation } from '@personalhealthtrain/central-common';
import useVuelidate from '@vuelidate/core';
import { minLength, required } from '@vuelidate/validators';
import type { PropType } from 'vue';
import {
    defineComponent, reactive, ref,
} from 'vue';
import { useAPI } from '../../../../composables/api';
import ProposalStationList from '../../proposal-station/ProposalStationList';
import MasterImagePicker from '../../master-image/MasterImagePicker';
import TrainStationList from '../../train-station/TrainStationList';
import TrainStationAssignAction from '../../train-station/TrainStationAssignAction';

export default defineComponent({
    components: {
        TrainStationAssignAction,
        TrainStationList,
        MasterImagePicker,
        ProposalStationList,
    },
    props: {
        train: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        const handleMasterImageSelected = async (item: MasterImage) => {
            try {
                const response = await useAPI().train.update(this.train.id, {
                    master_image_id: item ? item.id : null as string,
                });

                emit('updated', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        };

        const trainStationList = ref<null | Record<string, any>>(null);

        const handleTrainStationCreated = (item: TrainStation) => {
            if (trainStationList.value) {
                trainStationList.value.handleCreated(item);
            }

            if (item.train) {
                emit('updated', item.train);
            }
        };

        const handleTrainStationDeleted = (item: TrainStation) => {
            if (trainStationList.value) {
                trainStationList.value.handleDeleted(item);
            }

            if (item.train) {
                emit('updated', item.train);
            }
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleFailed,
            handleMasterImageSelected,
            handleTrainStationCreated,
            handleTrainStationDeleted,
            trainStationList,
        };
    },
});
</script>
<template>
    <div>
        <div class="mb-2">
            <h6><i class="fa fa-compact-disc" /> MasterImage</h6>
            <div class="mb-2">
                <master-image-picker
                    :entity-id="train.master_image_id"
                    @selected="handleMasterImageSelected"
                />
            </div>
        </div>

        <hr>

        <div>
            <h6><i class="fa fa-city" /> Stations</h6>

            <div class="row">
                <div class="col-12 col-xl-6">
                    <proposal-station-list
                        ref="proposalStationList"
                        :realm-id="train.realm_id"
                        :direction="'out'"
                        :query="{filter: {proposal_id: train.proposal_id}}"
                    >
                        <template #header-title>
                            <span>Stations <span class="text-info">available</span></span>
                        </template>

                        <template #item-actions="props">
                            <train-station-assign-action
                                :station-id="props.data.station_id"
                                :train-id="train.id"
                                :realm-id="train.realm_id"
                                @created="handleTrainStationCreated"
                                @deleted="handleTrainStationDeleted"
                                @failed="handleFailed"
                            />
                        </template>
                    </proposal-station-list>
                </div>
                <div class="col-12 col-xl-6">
                    <train-station-list
                        ref="trainStationList"
                        :realm-id="train.realm_id"
                        :direction="'out'"
                        :query="{filter: {train_id: train.id}}"
                    >
                        <template #header-title>
                            <span>Stations <span class="text-success">selected</span></span>
                        </template>
                    </train-station-list>
                </div>
            </div>
        </div>
    </div>
</template>
