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
        async stop() {
            if(this.busy) return;

            try {
                const train = await runTrainTask(this.train.id, 'start');
                this.$emit('stopped', train);
            } catch (e) {
                console.log(e);
                this.$emit('stopFailed', e);
            }
        }
    },
    computed: {
        isDisplayed() {
            return this.train.configuratorStatus === TrainConfiguratorStates.TrainConfiguratorStateCompleted &&
                this.train.status === TrainStates.TrainStateStarted &&
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
        v-if="isDisplayed && hideIfNotAllowed && !busy"
        class="btn btn-outline-danger btn-xs"
        type="button"
        @click.prevent="stop()"
    >
        <i class="fas fa-pause" />
    </button>
</template>
