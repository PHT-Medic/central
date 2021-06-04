<template>
    <div>
        <train-basic-form :proposal-id="proposal.id" @created="handleCreated"/>
    </div>
</template>
<script>
import TrainBasicForm from "@/components/train/TrainBasicForm";
export default {
    props: {
        proposal: Object
    },
    components: {TrainBasicForm},
    methods: {
        handleCreated() {
            this.$router.push({path: '/proposals/'+this.proposal.id+'/trains'});
        }
    }
}
</script>
