<script>
import TrainResultManagement from "@/components/train-result/TrainResultManagement";
import {TrainResultStatus} from "@/domains/train-result/type";

export default {
    components: {TrainResultManagement},
    props: {
        train: Object,
    },
    methods: {
        open() {
            this.$refs['result'].show();
        }
    },
    computed: {
        isAllowed() {
            return this.$auth.can('read','trainResult');
        },
        resultStatus() {
            return this.train.result ? this.train.result.status : null;
        },
        title() {
            switch (this.resultStatus) {
                case TrainResultStatus.DOWNLOADING:
                    return 'Downloading...';
                case TrainResultStatus.DOWNLOADED:
                    return 'Downloaded';
                case TrainResultStatus.EXTRACTING:
                    return 'Extracting...';
                case TrainResultStatus.EXTRACTED:
                    return 'Extracted';
                case TrainResultStatus.FINISHED:
                    return 'Finished';
                default:
                    return 'None';
            }
        }
    }
}
</script>
<template>
    <div>
        <button
            class="btn btn-xs btn-dark"
            :disabled="!isAllowed" @click.prevent="open"
            v-b-tooltip
        >
            <i class="fas fa-file-archive pr-1"></i> inspect
        </button>
        <b-modal
            size="lg"
            ref="result"
            button-size="sm"
            title-html="<i class='fas fa-file'></i> Train Result"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <train-result-management :train-property="train" />
        </b-modal>
    </div>
</template>
