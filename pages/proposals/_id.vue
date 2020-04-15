<script>
import ProposalApiService from './../../services/edge/proposal';

export default {
  meta: {
    requiresAuth: true
  },
  async asyncData (context) {
    try {
      const proposal = await ProposalApiService.getProposal({ id: context.params.id });

      return {
        proposal
      };
    } catch (e) {
      await context.app.$nuxt.$router.push('/proposals');
    }
  },
  data () {
    return {
      tabs: [
        { name: 'Status', routeName: 'proposals-id', icon: 'fas fa-bars', urlSuffix: '' },
        { name: 'Zug', routeName: 'proposal-train-discovery', icon: 'fas fa-train', urlSuffix: '/train' },
        { name: 'Editieren', routeName: 'proposals-id-edit', icon: 'fas fa-edit', urlSuffix: '/edit' }
      ]
    }
  },
  methods: {
    setProposal (data) {
      Object.assign(this.proposal, this.proposal, data);
    }
  }
}
</script>
<template>
  <div class="text-left">
    <h4 class="title">
      Antrag <span class="sub-title">ID {{ proposal.id }}: {{ proposal.title }}</span>
    </h4>
    <div class="m-b-20 m-t-10">
      <b-nav tabs>
        <b-nav-item
          v-for="(item,key) in tabs"
          :key="key"
          :disabled="item.active"
          :to="'/proposals/' + proposal.id + item.urlSuffix"
          exact
          exact-active-class="active"
        >
          <i :class="item.icon" />
          {{ item.name }}
        </b-nav-item>
      </b-nav>
    </div>
    <nuxt-child :proposal="proposal" @set-proposal="setProposal" />
  </div>
</template>
