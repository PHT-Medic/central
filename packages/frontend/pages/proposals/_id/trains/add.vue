<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
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
