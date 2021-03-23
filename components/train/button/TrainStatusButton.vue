<script>
import TrainStatusText from "@/components/train/text/TrainStatusText";
import {TrainStates} from "@/domains/train/index.ts";
export default {
    components: {TrainStatusText},
    props: {
        status: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            states: TrainStates
        }
    },
    methods: {
        click() {
            this.$emit('clicked', this.status);
        }
    }
}
</script>
<template>
    <button class="btn btn-xs" :class="{
        'btn-success': status === states.TrainStateBuilt || status === states.TrainStateStarted || status === states.TrainStateFinished || states.TrainStateConfigured,
        'btn-danger': status === states.TrainStateFailed,
        'btn-info': status === states.TrainStateBuilding || status === states.TrainStateStarting,
        'btn-warning': status === states.TrainStateStopped,
        'btn-secondary': !status
    }" @click.prevent="click" :disabled="!status">
        <train-status-text :status="status" />
    </button>
</template>
