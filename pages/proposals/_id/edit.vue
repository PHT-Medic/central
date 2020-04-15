<script>
import ProposalEditor from '../../../layouts/proposal/ProposalEditor';
// import ProposalService from './../../../services/edge/proposal';

export default {
  components: { ProposalEditor },
  props: {
    proposal: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  meta: {
    requiresAuth: true
  },
  data () {
    return {
      elements: {
        title: this.proposal.title,
        requestedData: this.proposal.requested_data,
        riskId: this.proposal.risk,
        riskComment: this.proposal.risk_comment,
        masterImageId: this.proposal.master_image_id,
        stationIds: []
      },
      withElements: ['title', 'masterImage', 'risk', 'riskComment', 'requestedData', 'stations']
    }
  },
  methods: {
    submit (e) {
      try {
        /*
        const data = await ProposalService.editProposal(this.proposal.id, {
          title: e.title,
          requested_data: e.requestedData,
          risk_comment: e.riskComment,
          risk: e.riskId,
          master_image_id: e.masterImageId,
          station_ids: e.stationIds
        });
         */

        this.$emit('set-proposal', {
          title: e.title,
          requested_data: e.requestedData,
          risk_comment: e.riskComment,
          risk_id: e.riskId,
          station_ids: e.stationIds,
          master_image_id: e.masterImageId
        });

        return this.proposal.id;
      } catch (e) {
        throw new Error(e.response.data.error.message);
      }
    }
  }
}
</script>
<template>
  <div class="text-left">
    <proposal-editor
      :with="withElements"
      :data="elements"
      :submit="submit"
    />
  </div>
</template>
