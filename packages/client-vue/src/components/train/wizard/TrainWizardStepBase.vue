<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { MasterImage, Train, TrainStation } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import {
    defineComponent, ref,
} from 'vue';
import ProposalStationList from '../../proposal-station/ProposalStationList';
import MasterImagePicker from '../../master-image/MasterImagePicker';
import TrainStationList from '../../train-station/TrainStationList';
import TrainStationAssignAction from '../../train-station/TrainStationAssignAction';
import { injectAPIClient } from '../../../core';

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
                const response = await injectAPIClient().train.update(props.train.id, {
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
                        :query="{filters: {proposal_id: train.proposal_id}}"
                    >
                        <template #headerTitle>
                            <span>Stations <span class="text-info">available</span></span>
                        </template>

                        <template #itemActions="props">
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
                    <TrainStationList
                        ref="trainStationList"
                        :realm-id="train.realm_id"
                        :direction="'out'"
                        :query="{filters: {train_id: train.id}}"
                    >
                        <template #headerTitle>
                            <span>Stations <span class="text-success">selected</span></span>
                        </template>
                    </TrainStationList>
                </div>
            </div>
        </div>
    </div>
</template>
