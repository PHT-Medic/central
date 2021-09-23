<script>
import { TrainResultStatus, TrainStates} from "@/domains/train";
import {runTrainResultTask} from "@/domains/train-result/api";
import {runTrainCommand} from "@/domains/train/api";
import TrainStatusText from "@/components/train/text/TrainStatusText";

export default {
    components: {TrainStatusText},
    props: {
        trainProperty: Object,
        resultProperty: Object | undefined
    },
    data() {
        return {
            train: undefined,
            result: undefined,
            resultStatus: TrainResultStatus,
            trainStates: TrainStates,

            busy: false
        }
    },
    created() {
        this.train = this.trainProperty;
        this.result = this.resultProperty ?? this.train.result;
    },
    methods: {
        download() {
            if(!this.train.result) return;

            let query = '';

            if(typeof this.train.result.downloadId === 'string') {
                query = '?downloadId='+this.train.result.downloadId;
            }

            window.open(this.$config.resultServiceApiUrl+'train-results/'+this.train.result.id+'/download' + query)
        },
        async reset() {
            if(this.busy || !this.result) return;

            this.busy = true;

            let title = 'Train Result';
            let message = 'Successfully reset result and rescheduled download and extracting process.';
            let variant = 'success';

            try {
                 const response = await runTrainResultTask(this.result.id, 'reset');

                 this.result.status = response.status;

                 this.$emit('updated', response);
            } catch (e) {
                message = e.message;
                variant = 'warning';
            }

            this.$bvToast.toast(message, {
                title,
                autoHideDelay: 5000,
                variant,
                toaster: 'b-toaster-top-center'
            });

            this.busy = false;
        },
        async scanHarbor() {
            if(this.busy) return;

            this.busy = true;

            let title = 'Train Result - Harbor';
            let message = 'Successfully scanned harbor repository for train image and rescheduled download and extracting process.';
            let variant = 'success';

            try {
                const response = await runTrainCommand(this.train.id, 'scanHarbor');

                this.result.status = response.status;

                this.$emit('updated', response);
            } catch (e) {
                variant = 'warning';
                message = e.message;
            }

            this.$bvToast.toast(message, {
                title,
                autoHideDelay: 5000,
                variant,
                toaster: 'b-toaster-top-center'
            });

            this.busy = false;
        }
    },
    computed: {
        isTrainFinished() {
            return this.train.status === TrainStates.TrainStateFinished;
        },
        isTrainResultInProgress() {
            return this.result &&
                (
                        this.result.status === TrainResultStatus.DOWNLOADING ||
                        this.result.status === TrainResultStatus.EXTRACTING
                 )
        }
    }
}
</script>
<template>
    <div>
        <h6>
            <i class="far fa-lightbulb"></i> Status: {{result ? result.status : 'Not available'}}
        </h6>

        <hr />

        <div class="row">
            <div class="col">
                <h6><i class="fa fa-download"></i> Download</h6>

                <p class="mb-2">Download the compressed train result files.</p>

                <button class="btn btn-primary btn-sm" @click.prevent="download" :disabled="!result || result.status !== resultStatus.FINISHED">
                    <i class="fa fa-download"></i> Download
                </button>

                <div
                    class="alert alert-sm mt-2"
                    :class="{
                    'alert-danger': result && result.status === resultStatus.FAILED,
                    'alert-info': !result || result.status !== resultStatus.FAILED
                    }"
                    v-if="!result || result.status !== resultStatus.FINISHED"
                >
                    <template v-if="result && result.status === resultStatus.FAILED">
                        The train result download or extracting progress failed.
                    </template>
                    <template v-else>
                        The train result is not available or completed yet.
                    </template>
                </div>
            </div>
            <div class="col">
                <h6><i class="fa fa-cog"></i> Settings</h6>

                <p class="mb-2">Reset the train result and reschedule the download and extraction from the image (train) repository.</p>

                <button class="btn btn-dark btn-xs" @click.prevent="reset" :disabled="!isTrainFinished || !result || isTrainResultInProgress">
                    Reset
                </button>

                <hr />

                <h6><i class="fas fa-folder-open"></i> Harbor</h6>

                <p class="mb-2">Scan the the image (train) repository for available results.</p>
                <!-- !isTrainFinished || -->
                <button class="btn btn-primary btn-xs" @click.prevent="scanHarbor">
                    Scan
                </button>
            </div>
        </div>
    </div>
</template>
