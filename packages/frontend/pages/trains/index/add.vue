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
            proposal_id: undefined
        }
    },
    methods: {
        handleCreated(train) {
            this.$router.push('/trains/'+train.id+'/wizard');
        }
    },
    created() {
        if(typeof this.$route.query.proposal_id !== "undefined") {
            const proposal_id = parseInt(this.$route.query.proposal_id);
            if(!Number.isNaN(proposal_id)) {
                this.proposal_id = proposal_id;
            }
        }
    },
}
</script>
<template>
    <train-basic-form
        :proposal-id="proposal_id"
        @created="handleCreated"
    />
</template>
