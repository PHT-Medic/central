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
        async build() {
            if(this.busy) return;

            try {
                const train = await runTrainTask(this.train.id, 'build');
                this.$emit('built', train);
            } catch (e) {
                this.$emit('buildFailed', e);
            }
        }
    },
    computed: {
        isDisplayed() {
            return this.train.configuratorStatus === TrainConfiguratorStates.TrainConfiguratorStateFinished &&
                (
                    this.train.status === TrainStates.TrainStateConfigured ||
                        this.train.status === TrainStates.TrainStateFailed ||
                        this.train.status === TrainStates.TrainStateBuilt
                )
            &&
                this.canExecute;
        },
        canExecute() {
            return this.$auth.can('edit','train');
        }
    }
}
</script>
<template>
    <button
        v-if="isDisplayed && hideIfNotAllowed && !busy"
        class="btn btn-outline-dark btn-xs"
        type="button"
        @click.prevent="build()"
    >
        <i class="fas fa-wrench" />
    </button>
</template>
