<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import TrainPipeline from '../../../components/domains/train/TrainPipeline';
import TrainStationsProgress from '../../../components/domains/train-station/progress/TrainStationsProgress';

export default {
    components: { TrainStationsProgress, TrainPipeline },
    props: {
        train: {
            type: Object,
            default: undefined,
        },
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
            <h6><i class="fa fa-city" /> <span class="text-info">{{ train.stations }}</span> Station(s)</h6>

            <train-stations-progress :entity="train" />
        </div>
        <div class="row">
            <div class="col-12 col-md-5">
                <div class="panel-box mb-3">
                    <h6><i class="fa fa-list" /> Pipeline</h6>

                    <train-pipeline
                        :list-direction="'column'"
                        :entity="train"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </div>
            </div>
            <div class="col-12 col-md-7">
                <div class="panel-box">
                    <h6><i class="fa fa-history" /> Logs</h6>

                    <div class="alert alert-info alert-sm mb-0">
                        Coming soon...
                    </div>
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
