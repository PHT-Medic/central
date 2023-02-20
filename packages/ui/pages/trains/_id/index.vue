<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Train } from '@personalhealthtrain/central-common';
import TrainLogs from '../../../components/domains/train/TrainLogs';
import TrainPipeline from '../../../components/domains/train/TrainPipeline.vue';
import TrainStationsProgress from '../../../components/domains/train-station/TrainStationsProgress.vue';

export default {
    components: { TrainLogs, TrainPipeline, TrainStationsProgress },
    props: {
        entity: Object as PropType<Train>,
    },
    methods: {
        handleUpdated(train) {
            this.$emit('updated', train);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
};
</script>

<template>
    <div>
        <div class="panel-box mb-3">
            <h6 class="mb-3">
                <span class="text-info">{{ entity.stations }}</span> Station(s)
                <i class="fa-solid fa-house-medical" />
            </h6>

            <train-stations-progress :entity="entity" />
        </div>
        <div class="row">
            <div class="col-12 col-md-5">
                <div class="panel-box mb-3">
                    <h6><i class="fa fa-list" /> Pipeline</h6>

                    <train-pipeline
                        :list-direction="'column'"
                        :entity="entity"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </div>
            </div>
            <div class="col-12 col-md-7">
                <div class="panel-box">
                    <h6><i class="fa fa-history" /> Logs</h6>

                    <train-logs :entity="entity" />
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.panel-box {
    background-color: #ececec;
    border: 1px solid #dedede;
    transition: all .3s ease-in-out;
    border-radius: 4px;
    padding: 0.5rem 1rem;
}
</style>
