<script>
    import { LayoutNavigationDefaultId } from "@/config/layout";
    import {getProposal} from "@/domains/proposal/api.ts";
    import {getApiProposalStation, getApiProposalStations} from "@/domains/proposal/station/api.ts";
    import ProposalSvg from "@/components/svg/ProposalSvg";
    import {getApiRealmStation} from "@/domains/realm/station/api";
    import ProposalStationAction from "@/components/proposal/ProposalStationAction";

    export default {
        components: {ProposalStationAction, ProposalSvg},
        meta: {
            requireLoggedIn: true,
            navigationId: LayoutNavigationDefaultId
        },
        async asyncData (context) {
            try {
                const proposal = await getProposal(context.params.id, {
                    include: ['masterImage', 'user']
                });

                const {realmId} = context.store.getters['auth/user'];

                let visitorStation = null;
                let visitorProposalStation = null;

                if(proposal.realmId !== realmId) {
                    try {
                        visitorStation = await getApiRealmStation(realmId);
                        const response = await getApiProposalStations({
                            filter: {
                                proposalId: proposal.id,
                                stationId: visitorStation.id
                            }
                        });

                        if(response.meta.total > 0 ) {
                            visitorProposalStation = response.data[0];
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }

                return {
                    proposal,
                    visitorStation,
                    visitorProposalStation
                };
            } catch (e) {
                await context.redirect('/proposals');
            }
        },
        data () {
            return {
                proposal: null,

                visitorStation: null,
                visitorProposalStation: null,

                proposalStations: [],
                proposalStationsLoading: false,

                sidebar: {
                    items: []
                }
            }
        },
        created() {
            this.fillSidebar();
            console.log(this.$route);
        },
        computed: {
            isProposalOwner() {
                return this.$store.getters['auth/user'].realmId === this.proposal.realmId;
            },
            isStationAuthority() {
                return !!this.visitorStation;
            },
            backLink() {
                if(typeof this.$route.query.refPath === 'string') {
                    return this.$route.query.refPath;
                }

                return '/proposals';
            }
        },
        methods: {
            fillSidebar() {
                const items = [
                    { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },

                ];

                if(this.isProposalOwner || this.isStationAuthority) {
                    items.push({ name: 'Trains', icon: 'fas fa-train', urlSuffix: '/trains' });
                }

                if(this.isProposalOwner) {
                    items.push({ name: 'Settings', icon: 'fa fa-cog', urlSuffix: '/settings' });
                }

                this.sidebar.items = items;
            },

            handleUpdated (data) {
                Object.assign(this.proposal, data);
            },
            handleProposalStationUpdated(item) {
                if(typeof this.visitorProposalStation !== 'undefined' && this.visitorProposalStation.id === item.id) {
                    this.visitorProposalStation.status = item.status;
                }
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
                    <div class="flex-wrap flex-row d-flex align-items-center">
                        <div>
                            <b-nav pills>
                                <b-nav-item
                                    :to="backLink"
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

        <nuxt-child
            :proposal="proposal"
            :visitor-station="visitorStation"
            @updated="handleUpdated"
            @proposalStationUpdated="handleProposalStationUpdated"
            :visitor-proposal-station="visitorProposalStation"
        />
    </div>
</template>
