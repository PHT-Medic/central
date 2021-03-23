<script>
import { TrainStates } from "@/domains/train/index.ts";

export default {
    props: {
        status: {
            type: String,
            default: undefined
        }
    },
    data() {
        return {
            states: TrainStates
        }
    }
}
</script>
<template>
    <span>
        <template v-if="status === states.TrainStateConfigured">
            configured...
        </template>
        <template v-else-if="status === states.TrainStateBuilding">
            building...
        </template>
        <template v-else-if="status === states.TrainStateBuilt">
            built
        </template>
        <template v-else-if="status === states.TrainStateStarting">
            starting...
        </template>
        <template v-else-if="status === states.TrainStateStarted">
            started
        </template>
        <template v-else-if="status === states.TrainStateFinished">
            finished
        </template>
        <template v-else-if="status === states.TrainStateStopped">
            stopped
        </template>
        <template v-else-if="status === states.TrainStateFailed">
            failed
        </template>
        <template v-else>
            none
        </template>
    </span>
</template>
