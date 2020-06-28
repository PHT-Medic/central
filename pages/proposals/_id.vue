<script>
    import ProposalEdge from '../../services/edge/proposal/proposalEdge';
    import {adminNavigationId, defaultNavigationId} from "../../config/layout";
    import ProposalStationEdge from "../../services/edge/proposal/proposalStationEdge";

    export default {
        meta: {
            requireLoggedIn: true,
            navigationId: defaultNavigationId
        },
        async asyncData (context) {
            try {
                const proposal = await ProposalEdge.getProposal(context.params.id);

                return {
                    proposal
                };
            } catch (e) {
                console.log(e);
                await context.redirect('/proposals');
            }
        },
        data () {
            return {
                proposal: null,

                proposalStations: [],
                proposalStationsLoading: false,

                tabs: [
                    { name: 'Info', routeName: 'proposals-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Zug', routeName: 'proposal-train-discovery', icon: 'fas fa-train', urlSuffix: '/train' }
                ]
            }
        },
        created() {
            this.getProposalStations();
        },
        methods: {
            async getProposalStations() {
                if(this.proposalStationsLoading) return;

                this.proposalStationsLoading = true;

                this.proposalStations = await ProposalStationEdge.getStations(this.proposal.id);

                this.proposalStationsLoading = false;
            },
            setProposal (data) {
                console.log(data);
                Object.assign(this.proposal, this.proposal, data);
            }
        }
    }
</script>
<template>
    <div class="text-left">
        <h4 class="title m-b-20">
            Antrag #{{ proposal.id }} <span class="sub-title">{{ proposal.title }}</span>
        </h4>
        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex">
                        <div>
                            <b-nav pills>
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
                    </div>

                </div>
            </div>
        </div>
        <nuxt-child :proposal="proposal" :proposal-stations="proposalStations" @set-proposal="setProposal" />
    </div>
</template>
