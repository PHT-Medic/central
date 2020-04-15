<script>
import proposalService from '../../services/edge/proposal';

export default {
  meta: {
    requiresAuth: true
  },
  async asyncData (context) {
    try {
      const items = await proposalService.getOutProposals();

      return {
        items
      };
    } catch (e) {
      await context.app.$nuxt.$router.push('proposals');
    }
  },
  data () {
    return {
      isBusy: false,
      fields: [
        { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'title', label: 'Titel', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'stations_approved', label: 'Akzeptiert', thClass: 'text-center', tdClass: 'text-center' },
        { key: 'stations_declined', label: 'Abgelehnt', thClass: 'text-center', tdClass: 'text-center' },
        { key: 'master_image.name', label: 'Master Image', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'options', label: '', tdClass: 'text-left' }
      ],
      items: []
    }
  },
  methods: {
    async dropProposal (index) {
      const proposal = this.items[index];
      const confirmed = confirm('Den Antrag ' + proposal.title + ' (ID: ' + proposal.id + ') zurückziehen?');
      if (confirmed) {
        try {
          await proposalService.dropProposal(proposal.id);
          this.items.splice(index, 1);
        } catch (e) {

        }
      }
    }
  }
}
</script>
<template>
  <div class="text-left">
    <div class="m-b-10">
      <h4 class="title">
        Anträge <span class="sub-title">Übersicht</span>
      </h4>
    </div>
    <div>
      Dies ist eine Übersicht von Anträgen, die Sie erstellt haben.
    </div>
    <div class="m-t-10">
      <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
        <template v-slot:cell(stations_approved)="data">
          {{ data.item.stations.approved }} / {{ data.item.stations.total }}
        </template>
        <template v-slot:cell(stations_declined)="data">
          {{ data.item.stations.declined }} / {{ data.item.stations.total }}
        </template>
        <template v-slot:cell(options)="data">
          <nuxt-link :to="'/proposals/' + data.item.id " title="Ansicht" class="btn btn-outline-primary btn-xs">
            <i class="fa fa-search-location" />
          </nuxt-link>
          <nuxt-link :to="'/proposals/' + data.item.id + '/edit'" title="Editieren" class="btn btn-outline-dark btn-xs">
            <i class="fa fa-pen-alt" />
          </nuxt-link>
          <a class="btn btn-outline-danger btn-xs" title="Löschen" @click="dropProposal(data.index)">
            <i class="fas fa-trash-alt" /></a>
        </template>

        <template v-slot:table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong>Loading...</strong>
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>
