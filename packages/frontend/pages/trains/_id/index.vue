<script>
import TrainPipeline from "@/components/train/TrainPipeline";
import TrainStationsProgress from "@/components/train-station/progress/TrainStationsProgress";
export default {
    components: {TrainStationsProgress, TrainPipeline},
    props: {
        train: Object
    },
    methods: {
        handleDone(train) {
            this.$emit('updated', train);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        }
    }
}
</script>

<template>
    <div class="row">
        <div class="col-6">
            <div class="panel-box mb-3">
                <h6><i class="fa fa-list"></i> Pipeline</h6>

                <train-pipeline
                    :train-property="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>

            <div class="panel-box">
                <h6><i class="fa fa-city"></i> Stations</h6>

                <train-stations-progress :train="train" />
            </div>
        </div>
        <div class="col-6">
            <div class="panel-box">
                <h6><i class="fa fa-history"></i> Logs</h6>

                <div class="alert alert-info alert-sm mb-0">
                    Coming soon...
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
