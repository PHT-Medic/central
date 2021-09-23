<script>
    import {getTrainStations} from "@/domains/train-station/api";
    import {TrainBuildStatus, TrainRunStatus} from "@/domains/train";
    import TrainStationRunStatusText from "@/components/train-station/status/TrainStationRunStatusText";
    import {TrainStationStatic} from "@/domains/train-station/type";
    import TrainStationStaticRunStatusText from "@/components/train-station/status/TrainStationStaticRunStatusText";

    export default {
        components: {TrainStationStaticRunStatusText, TrainStationRunStatusText},
        props: {
            train: Object
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
                    const response = await getTrainStations({
                        filter: {
                            trainId: this.train.id
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
                if(this.train.buildStatus !== TrainBuildStatus.FINISHED) {
                    return 0;
                }

                const total = this.meta.total + 2; // + 2 because incoming + outgoing

                // no index -> outgoing or incoming
                if(!this.train.runStationIndex) {
                    // outgoing, because train terminated
                    if(this.train.runStatus === TrainRunStatus.FINISHED) {
                        return 100;
                    } else {
                        return 100 * (1 / total);
                    }
                }

                return 100 * ((this.train.runStationIndex + 1) / total);
            },
            isIncomingStation() {
                return this.train.runStatus === TrainRunStatus.STARTED &&
                    this.train.runStationIndex === 0;
            },
            isOutgoingStation() {
                return this.train.runStatus === TrainRunStatus.FINISHED;
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
                        :train-build-status="train.buildStatus"
                        :train-run-status="train.runStatus"
                        :train-run-station-index="train.runStationIndex"
                    />
                </div>
            </div>
            <template v-for="(item,key) in items">
                <div class="progress-step d-flex flex-column text-center">
                    <div class="">
                        <strong>Status</strong>
                    </div>
                    <div>
                        <train-station-run-status-text :status="item.runStatus" />
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
                        :train-build-status="train.buildStatus"
                        :train-run-status="train.runStatus"
                        :train-run-station-index="train.runStationIndex"
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
