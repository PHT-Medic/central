<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import TrainWizard from "../../../components/train/TrainWizard";
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
