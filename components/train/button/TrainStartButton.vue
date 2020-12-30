<script>
import {TrainConfiguratorStates, TrainStates} from "@/domains/train/index.ts";
import {runTrainTask} from "@/domains/train/api.ts";

export default {
    props: {
        train: {
            type: Object,
            default: undefined
        },
        hideIfNotAllowed: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            busy: false
        }
    },
    methods: {
        async start() {
            if(this.busy) return;

            this.busy = true;

            try {
                const train = await runTrainTask(this.train.id, 'start');
                this.$emit('started', train);
            } catch (e) {
                console.log(e);
                this.$emit('startFailed', e);
            }

            this.busy = false;
        }
    },
    computed: {
        isDisplayed() {
            return this.train.configuratorStatus === TrainConfiguratorStates.TrainConfiguratorStateCompleted &&
                this.train.status === TrainStates.TrainStateBuilt &&
                this.canExecute;
        },
        canExecute() {
            return this.$auth.can('start','trainExecution');
        }
    }
}
</script>
<template>
    <button
        v-if="isDisplayed && hideIfNotAllowed"
        :disabled="busy"
        class="btn btn-outline-success btn-xs"
        type="button"
        @click="start()"
    >
        <i class="fas fa-play" />
    </button>
</template>
