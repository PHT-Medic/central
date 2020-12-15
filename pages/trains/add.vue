<script>
import TrainBasicForm from "@/components/train/TrainBasicForm";

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
    <div class="container">
        <h5 class="title">
            Train <span class="sub-title">add</span>
        </h5>

        <train-basic-form
            :proposal-id="proposalId"
            @created="handleCreated"
        />
    </div>
</template>
