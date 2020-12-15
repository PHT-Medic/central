<script>
import { TrainConfiguratorStates } from "@/domains/train/index.ts";

export default {
    props: {
        status: {
            type: String,
            default: undefined
        }
    },
    data() {
        return {
            configurationStates: TrainConfiguratorStates
        }
    }
}
</script>
<template>
    <span>
        <template v-if="status === configurationStates.TrainConfiguratorStateOpen">
            open
        </template>
        <template v-else-if="status === configurationStates.TrainConfiguratorStateFilesUploaded">
            files uploaded
        </template>
        <template v-else-if="status === configurationStates.TrainConfiguratorStateHashGenerated">
            hash generated
        </template>
        <template v-else-if="status === configurationStates.TrainConfiguratorStateHashSigned">
            hash signed
        </template>
        <template v-else-if="status === configurationStates.TrainConfiguratorStateCompleted">
            completed
        </template>
        <template v-else>
            unknown {{status}}
        </template>
    </span>
</template>
