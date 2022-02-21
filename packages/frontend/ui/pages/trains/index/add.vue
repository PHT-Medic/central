<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import TrainBasicForm from '../../../components/domains/train/TrainBasicForm';

export default {
    components: { TrainBasicForm },
    data() {
        return {
            proposal_id: undefined,
        };
    },
    computed: {
        realmId() {
            return this.$store.getters['auth/userRealmId'];
        },
    },
    created() {
        if (typeof this.$route.query.proposal_id !== 'undefined') {
            const proposalId = parseInt(this.$route.query.proposal_id, 10);
            if (!Number.isNaN(proposalId)) {
                this.proposal_id = proposalId;
            }
        }
    },
    methods: {
        handleCreated(train) {
            this.$router.push(`/trains/${train.id}/setup`);
        },
    },
};
</script>
<template>
    <train-basic-form
        :proposal-id="proposal_id"
        :realm-id="realmId"
        @created="handleCreated"
    />
</template>
