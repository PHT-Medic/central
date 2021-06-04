<script>
import TrainWizard from "@/components/train/TrainWizard";
export default {
    components: {TrainWizard},
    props: {
        train: {
            type: Object,
            default: undefined
        }
    },
    methods: {
        handleUpdated(train) {
            console.log('updated', train);
            this.$emit('updated', train);
        }
    }
}
</script>
<template>
    <train-wizard :train-property="train" @updated="handleUpdated" />
</template>
