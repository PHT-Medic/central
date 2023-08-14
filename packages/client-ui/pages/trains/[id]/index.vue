<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Train } from '@personalhealthtrain/core';
import { TrainLogs, TrainPipeline, TrainStationsProgress } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { TrainLogs, TrainPipeline, TrainStationsProgress },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['failed', 'executed', 'updated'],
    setup(props, { emit }) {
        const handleUpdated = (train: Train) => {
            emit('updated', train);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleExecuted = (component: string, command: string) => {
            emit('executed', component, command);
        };

        return {
            handleUpdated,
            handleFailed,
            handleExecuted,
        };
    },
});
</script>

<template>
    <div v-if="entity">
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
                        @executed="handleExecuted"
                    />
                </div>
            </div>
            <div class="col-12 col-md-7">
                <div class="panel-box">
                    <h6><i class="fa fa-history" /> Logs</h6>

                    <TrainLogs :entity-id="entity.id" />
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
