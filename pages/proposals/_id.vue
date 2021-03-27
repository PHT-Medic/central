<script>
    import { LayoutNavigationDefaultId } from "../../config/layout";
    import {getProposal} from "@/domains/proposal/api.ts";
    import {getApiProposalStations} from "@/domains/proposal/station/api.ts";
    import ProposalSvg from "@/components/svg/ProposalSvg";

    export default {
        components: {ProposalSvg},
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

                sidebar: {
                    items: [
                        { name: 'General', routeName: 'proposals-id', icon: 'fas fa-bars', urlSuffix: '' },
                        { name: 'Trains', routeName: 'proposal-trains', icon: 'fas fa-train', urlSuffix: '/trains' }

                    ]
                }
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
    <div>
        <h1 class="title no-border mb-3">{{ proposal.title }}</h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex">
                        <div>
                            <b-nav pills>
                                <b-nav-item
                                    :to="'/proposals'"
                                    exact
                                    exact-active-class="active"
                                >
                                    <i class="fa fa-arrow-left" />
                                </b-nav-item>

                                <b-nav-item
                                    v-for="(item,key) in sidebar.items"
                                    :key="key"
                                    :disabled="item.active"
                                    :to="'/proposals/' + proposal.id + item.urlSuffix"
                                    :active="$route.path.startsWith('/proposals/'+proposal.id + item.urlSuffix) && item.urlSuffix.length !== 0"
                                    exact-active-class="active"
                                    exact
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
