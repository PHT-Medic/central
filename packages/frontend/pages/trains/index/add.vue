<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import TrainBasicForm from "../../../components/train/TrainBasicForm";

export default {
    components: {TrainBasicForm},
    data() {
        return {
            proposalId: undefined
        }
    },
    methods: {
        handleCreated(train) {
            this.$router.push('/trains/'+train.id+'/wizard');
        }
    },
    created() {
        if(typeof this.$route.query.proposalId !== "undefined") {
            const proposalId = parseInt(this.$route.query.proposalId);
            if(!Number.isNaN(proposalId)) {
                this.proposalId = proposalId;
            }
        }
    },
}
</script>
<template>
    <train-basic-form
        :proposal-id="proposalId"
        @created="handleCreated"
    />
</template>
