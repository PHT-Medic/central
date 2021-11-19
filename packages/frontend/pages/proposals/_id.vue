<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getApiProposalStations, getAPIStations, getProposal, PermissionID} from "@personalhealthtrain/ui-common";
    import ProposalSvg from "../../components/svg/ProposalSvg";
    import {Layout, LayoutNavigationID} from "../../modules/layout/contants";

    export default {
        components: {ProposalSvg},
        meta: {
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.DEFAULT
        },
        async asyncData (context) {
            try {
                const proposal = await getProposal(context.params.id, {
                    include: {
                        master_image: true,
                        user: true
                    }
                });

                console.log(proposal);

                const {realm_id} = context.store.getters['auth/user'];

                let visitorStation = null;
                let visitorProposalStation = null;

                if(proposal.realm_id !== realm_id) {
                    try {
                        const {data: stations} = await getAPIStations({
                            filter: {
                                realm_id: proposal.realm_id
                            }
                        });

                        if(stations.length === 1) {
                            visitorStation = stations[0];

                            const response = await getApiProposalStations({
                                filter: {
                                    proposal_id: proposal.id,
                                    station_id: stations[0].id
                                }
                            });

                            if (response.meta.total > 0) {
                                visitorProposalStation = response.data[0];
                            }
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
                return this.$store.getters['auth/user'].realm_id === this.proposal.realm_id;
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

                if(
                    this.isProposalOwner || this.isStationAuthority
                ) {
                    items.push({ name: 'Trains', icon: 'fas fa-train', urlSuffix: '/trains' });
                }

                if(
                    this.isProposalOwner &&
                    this.$auth.hasPermission(PermissionID.PROPOSAL_EDIT)
                ) {
                    items.push({ name: 'Settings', icon: 'fa fa-cog', urlSuffix: '/settings' });
                }

                this.sidebar.items = items;
            },

            handleUpdated (data) {
                Object.assign(this.proposal, data);
            },
            handleProposalStationUpdated(item) {
                if(typeof this.visitorProposalStation !== 'undefined' && this.visitorProposalStation.id === item.id) {
                    this.visitorProposalStation.approval_status = item.approval_status;
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
