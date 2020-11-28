<script>
    import { LayoutNavigationDefaultId } from "../../config/layout";
    import {getProposal} from "@/domains/proposal/api.ts";
    import {getApiProposalStations} from "@/domains/proposal/station/api.ts";

    export default {
        meta: {
            requireLoggedIn: true,
            navigationId: LayoutNavigationDefaultId
        },
        async asyncData (context) {
            try {
                const proposal = await getProposal(context.params.id);

                return {
                    proposal
                };
            } catch (e) {
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
                    { name: 'Stationen', routeName: 'proposal-stations', icon: 'fas fa-university', urlSuffix: '/stations'},
                    { name: 'Züge', routeName: 'proposal-trains', icon: 'fas fa-train', urlSuffix: '/trains' }
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

                this.proposalStations = await getApiProposalStations(this.proposal.id, 'self');

                this.proposalStationsLoading = false;
            },
            setProposal (data) {
                Object.assign(this.proposal, data);
            }
        }
    }
</script>
<template>
    <div class="container">
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
        <nuxt-child :proposal="proposal" :proposal-stations="proposalStations" @updated="setProposal" />
    </div>
</template>
