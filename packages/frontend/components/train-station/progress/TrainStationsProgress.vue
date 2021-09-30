<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {getAPITrainStations, Train, TrainBuildStatus, TrainRunStatus, TrainStationStatic} from "@personalhealthtrain/ui-common";
    import TrainStationRunStatusText from "../../../components/train-station/status/TrainStationRunStatusText";
    import TrainStationStaticRunStatusText from "../../../components/train-station/status/TrainStationStaticRunStatusText";

    export default {
        components: {TrainStationStaticRunStatusText, TrainStationRunStatusText},
        props: {
            train: Train
        },
        data() {
            return {
                meta: {
                    limit: 20,
                    offset: 0,
                    total: 0
                },
                items: [],
                busy: false,

                trainStationStatic: TrainStationStatic
            }
        },
        created() {
            this.load().then(r => r);
        },
        methods: {
            async load() {
                if(this.busy) return;

                this.busy = false;

                try {
                    const response = await getAPITrainStations({
                        filter: {
                            train_id: this.train.id
                        }
                    });

                    this.meta = response.meta;
                    this.items = response.data;
                } catch (e) {
                    this.$emit('failed', e);
                }

                this.busy = false;
            }
        },
        computed: {
            progressPercentage() {
                if(this.train.build_status !== TrainBuildStatus.FINISHED) {
                    return 0;
                }

                const total = this.meta.total + 2; // + 2 because incoming + outgoing

                // no index -> outgoing or incoming
                if(!this.train.run_station_index) {
                    // outgoing, because train terminated
                    if(this.train.run_status === TrainRunStatus.FINISHED) {
                        return 100;
                    } else {
                        return 100 * (1 / total);
                    }
                }

                return 100 * ((this.train.run_station_index + 1) / total);
            }
        }
    }
</script>
<template>
    <div>
        <div class="progress-with-circle">
            <div class="progress-bar" :style="{width: progressPercentage + '%'}" style="background-color: rgb(51, 51, 51); color: rgb(51, 51, 51);"></div>
        </div>
        <div class="d-flex flex-row justify-content-between position-relative">
            <div class="icon-circle progress-step bg-dark text-light">
                <span class="icon">Incoming Station</span>
            </div>
            <template v-for="(item,key) in items">
                <div class="icon-circle progress-step bg-dark text-light">
                    <span class="icon">Station {{key + 1}}</span>
                </div>
            </template>
            <div class="icon-circle progress-step bg-dark text-light">
                <span class="icon">Outgoing Station</span>
            </div>
        </div>
        <div class="d-flex flex-row justify-content-between position-relative mt-1">
            <div class="progress-step d-flex flex-column text-center">
                <div class="">
                    <strong>Status</strong>
                </div>
                <div>
                    <train-station-static-run-status-text
                        :id="trainStationStatic.INCOMING"
                        :train-build-status="train.build_status"
                        :train-run-status="train.run_status"
                        :train-run-station-index="train.run_station_index"
                    />
                </div>
            </div>
            <template v-for="(item) in items">
                <div class="progress-step d-flex flex-column text-center">
                    <div class="">
                        <strong>Status</strong>
                    </div>
                    <div>
                        <train-station-run-status-text :status="item.run_status" />
                    </div>
                </div>
            </template>
            <div class="progress-step d-flex flex-column text-center">
                <div class="">
                    <strong>Status</strong>
                </div>
                <div>
                    <train-station-static-run-status-text
                        :id="trainStationStatic.OUTGOING"
                        :train-build-status="train.build_status"
                        :train-run-status="train.run_status"
                        :train-run-station-index="train.run_station_index"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.progress-with-circle {
    position: relative;
    top: 40px;
    height: 4px;
}

.progress-with-circle .progress-bar {
    box-shadow: none;
    -webkit-transition: width .3s ease;
    -o-transition: width .3s ease;
    transition: width .3s ease;
    height: 100%;
}

.progress-step {
    width: 70px;
    display: flex;
    justify-content: center;
    align-content: center;
    text-align: center;

}

.icon-circle {
    font-weight: 600;
    height: 70px;
    background-color: #ececec;
    position: relative;
    border-radius: 50%;
}

.icon-circle .icon {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
}
</style>
