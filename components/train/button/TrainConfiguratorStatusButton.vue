<script>
import {TrainConfiguratorStates} from "@/domains/train/index.ts";
import TrainConfiguratorStatusText from "@/components/train/text/TrainConfiguratorStatusText";

export default {
    components: {TrainConfiguratorStatusText},
    props: {
        status: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            states: TrainConfiguratorStates
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
        'btn-info': status === states.TrainConfiguratorStateFilesUploaded || status === states.TrainConfiguratorStateHashSigned || status === states.TrainConfiguratorStateHashGenerated,
        'btn-success': status === states.TrainConfiguratorStateCompleted,
        'btn-dark': status === states.TrainConfiguratorStateOpen,
        'btn-secondary': !status
    }" @click.prevent="click">
        <train-configurator-status-text :status="status" />
    </button>
</template>
