<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Train, TrainStation } from '@personalhealthtrain/central-common';
import {
    TrainBuildStatus,
    TrainRunStatus,
    TrainStationRunStatus,
    TrainStationStatic,
} from '@personalhealthtrain/central-common';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import { computed, defineComponent, toRef } from 'vue';
import TrainStationRunStatusText from './TrainStationRunStatus';
import TrainStationStaticRunStatusText from './TrainStationStaticRunStatus';
import TrainStationList from './TrainStationList';

export default defineComponent({
    components: { TrainStationList, TrainStationStaticRunStatusText, TrainStationRunStatusText },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
        withHeader: {
            type: Boolean,
            default: false,
        },
        elementType: {
            type: String,
            default: 'steps',
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');

        const query : BuildInput<TrainStation> = {
            filter: {
                train_id: entity.value.id,
            },
            sort: {
                index: 'ASC',
            },
        };

        const progressPercentage = computed(() => {
            if (entity.value.build_status !== TrainBuildStatus.FINISHED) {
                return 0;
            }

            const total = entity.value.stations + 2; // + 2 because incoming + outgoing

            if (entity.value.run_status === TrainRunStatus.FINISHED) {
                return 100;
            }

            let position = 0;

            if (entity.value.run_station_index) {
                position = entity.value.run_station_index + 2;
            } else {
                position = 1;
            }

            return 100 * (position / total);
        });

        return {
            query,
            progressPercentage,
            trainRunStatus: TrainRunStatus,
            trainStationStatic: TrainStationStatic,
            trainStationRunStatus: TrainStationRunStatus,
        };
    },
});
</script>
<template>
    <div>
        <template v-if="elementType === 'steps'">
            <div class="train-stations-progress">
                <TrainStationList
                    :query="query"
                    :header-title="false"
                    :header-search="false"
                    :footer-pagination="false"
                    :no-more="false"
                    :realm-id="entity.realm_id"
                    :source-id="entity.id"
                >
                    <template #body="props">
                        <div
                            v-if="!props.busy"
                            class="d-flex flex-column progress-step"
                        >
                            <div class="d-flex justify-content-center icon-circle bg-dark text-light">
                                <span class="icon">Incoming</span>
                            </div>
                            <div class="mt-1">
                                <strong>Status</strong>
                            </div>
                            <div>
                                <train-station-static-run-status-text
                                    :id="trainStationStatic.INCOMING"
                                    :train-build-status="entity.build_status"
                                    :train-run-status="entity.run_status"
                                    :train-run-station-index="entity.run_station_index"
                                />
                            </div>
                        </div>
                        <template
                            v-for="(item) in props.data"
                            :key="item.id"
                        >
                            <div
                                class="d-flex flex-column progress-step"
                            >
                                <div
                                    class="d-flex justify-content-center icon-circle progress-step text-light"
                                    :class="{
                                        'bg-secondary': !item.run_status,
                                        'bg-dark': item.run_status === trainStationRunStatus.DEPARTED,
                                        'active': item.run_status === trainStationRunStatus.ARRIVED
                                    }"
                                >
                                    <span class="icon">{{ item.station.name }}</span>
                                </div>
                                <div class="mt-1">
                                    <strong>Status</strong>
                                </div>
                                <div>
                                    <train-station-run-status-text :status="item.run_status" />
                                </div>
                            </div>
                        </template>
                        <div
                            v-if="!props.busy"
                            class="d-flex flex-column progress-step"
                        >
                            <div class="d-flex justify-content-center icon-circle bg-dark text-light">
                                <span class="icon">Outgoing</span>
                            </div>
                            <div class="mt-1">
                                <strong>Status</strong>
                            </div>
                            <div>
                                <train-station-static-run-status-text
                                    :id="trainStationStatic.OUTGOING"
                                    :train-build-status="entity.build_status"
                                    :train-run-status="entity.run_status"
                                    :train-run-station-index="entity.run_station_index"
                                />
                            </div>
                        </div>
                    </template>
                </TrainStationList>
            </div>
        </template>
        <template v-else>
            <div class="progress bg-white">
                <div
                    class="progress-bar"
                    :class="{
                        'bg-dark': entity.run_status !== trainRunStatus.FINISHED,
                        'bg-success': entity.run_status === trainRunStatus.FINISHED
                    }"
                    :style="{width: progressPercentage + '%'}"
                    :aria-valuenow="progressPercentage"
                    aria-valuemin="0"
                    aria-valuemax="100"
                />
            </div>
        </template>
    </div>
</template>
