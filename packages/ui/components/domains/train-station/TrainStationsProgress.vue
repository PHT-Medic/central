<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    Train,
    TrainBuildStatus,
    TrainRunStatus,
    TrainStationRunStatus,
    TrainStationStatic,
} from '@personalhealthtrain/central-common';
import Vue, { PropType } from 'vue';
import TrainStationRunStatusText from './TrainStationRunStatus';
import TrainStationStaticRunStatusText from './TrainStationStaticRunStatus';
import { TrainStationList } from './TrainStationList';

export default Vue.extend({
    name: 'TrainStationsProgress',
    components: { TrainStationList, TrainStationStaticRunStatusText, TrainStationRunStatusText },
    props: {
        entity: Object as PropType<Train>,
        withHeader: {
            type: Boolean,
            default: false,
        },
        elementType: {
            type: String,
            default: 'steps',
        },
    },
    data() {
        return {
            trainRunStatus: TrainRunStatus,
            trainStationStatic: TrainStationStatic,
            trainStationRunStatus: TrainStationRunStatus,
        };
    },
    computed: {
        query() {
            return {
                filter: {
                    train_id: this.entity.id,
                },
                sort: {
                    index: 'ASC',
                },
            };
        },
        progressPercentage() {
            if (this.entity.build_status !== TrainBuildStatus.FINISHED) {
                return 0;
            }

            const total = this.entity.stations + 2; // + 2 because incoming + outgoing

            if (this.entity.run_status === TrainRunStatus.FINISHED) {
                return 100;
            }

            let position = 0;

            if (this.entity.run_station_index) {
                position = this.entity.run_station_index + 2;
            } else {
                position = 1;
            }

            return 100 * (position / total);
        },
    },
});
</script>
<template>
    <div>
        <template v-if="elementType === 'steps'">
            <train-station-list
                :query="query"
                :with-header="false"
                :with-pagination="false"
                :with-search="false"
                :with-no-more="false"
                :realm-id="entity.realm_id"
                :source-id="entity.id"
                class="train-stations-progress"
            >
                <template
                    #items="props"
                >
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
                    <template v-for="(item) in props.items">
                        <div
                            :key="item.id"
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
            </train-station-list>
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
<style>
.train-stations-progress .list-items {
    flex-direction: row;
    justify-content: space-between;
    display: flex;
}
</style>
