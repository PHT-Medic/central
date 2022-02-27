<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    PermissionID,
} from '@personalhealthtrain/central-common';
import Vue from 'vue';
import { LayoutKey, LayoutNavigationID } from '../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    async asyncData(context) {
        try {
            const proposal = await context.$api.proposal.getOne(context.params.id, {
                include: {
                    master_image: true,
                    user: true,
                },
            });

            const { realm_id: realmId } = context.store.getters['auth/user'];

            let visitorStation = null;
            let visitorProposalStation = null;

            if (proposal.realm_id !== realmId) {
                try {
                    const { data: stations } = await context.$api.station.getMany({
                        filter: {
                            realm_id: proposal.realm_id,
                        },
                    });

                    if (stations.length === 1) {
                        // eslint-disable-next-line prefer-destructuring
                        visitorStation = stations[0];

                        const response = await context.$api.proposalStation.getMany({
                            filter: {
                                proposal_id: proposal.id,
                                station_id: stations[0].id,
                            },
                        });

                        if (response.meta.total > 0) {
                            // eslint-disable-next-line prefer-destructuring
                            visitorProposalStation = response.data[0];
                        }
                    }
                } catch (e) {
                    // ...
                }
            }

            return {
                entity: proposal,
                visitorStation,
                visitorProposalStation,
            };
        } catch (e) {
            await context.redirect('/proposals');

            return {

            };
        }
    },
    data() {
        return {
            entity: null,

            visitorStation: null,
            visitorProposalStation: null,

            proposalStations: [],
            proposalStationsLoading: false,

            sidebar: {
                items: [],
            },
        };
    },
    computed: {
        isProposalOwner() {
            return this.$store.getters['auth/user'].realm_id === this.entity.realm_id;
        },
        isStationAuthority() {
            return !!this.visitorStation;
        },
        backLink() {
            if (typeof this.$route.query.refPath === 'string') {
                return this.$route.query.refPath;
            }

            return '/proposals';
        },
    },
    created() {
        this.fillSidebar();
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.entity.realm_id);
        socket.emit('proposalsSubscribe', { data: { id: this.entity.id } });
        socket.on('proposalUpdated', this.handleSocketUpdated);
        socket.on('proposalDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.entity.realm_id);
        socket.emit('proposalsSubscribe', { data: { id: this.entity.id } });
        socket.off('proposalUpdated', this.handleSocketUpdated);
        socket.off('proposalDeleted', this.handleSocketDeleted);
    },
    methods: {
        handleSocketUpdated(context) {
            if (
                this.entity.id !== context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            this.handleUpdated(context.data);
        },
        async handleSocketDeleted(context) {
            if (
                this.entity.id !== context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            await this.handleDeleted(context.data);
        },
        fillSidebar() {
            const items = [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },

            ];

            if (
                this.isProposalOwner || this.isStationAuthority
            ) {
                items.push({ name: 'Trains', icon: 'fas fa-train', urlSuffix: '/trains' });
            }

            if (
                this.isProposalOwner &&
                    this.$auth.hasPermission(PermissionID.PROPOSAL_EDIT)
            ) {
                items.push({ name: 'Settings', icon: 'fa fa-cog', urlSuffix: '/settings' });
            }

            this.sidebar.items = items;
        },

        handleUpdated(data) {
            const keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.entity, keys[i], data[keys[i]]);
            }
        },
        async handleDeleted() {
            await this.$nuxt.$router.push('/proposals');
        },
        handleProposalStationUpdated(item) {
            if (typeof this.visitorProposalStation !== 'undefined' && this.visitorProposalStation.id === item.id) {
                this.visitorProposalStation.approval_status = item.approval_status;
            }
        },
    },
};
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            📜 {{ entity.title }}
        </h1>

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
                                    v-for="(tab,key) in sidebar.items"
                                    :key="key"
                                    :disabled="tab.active"
                                    :to="'/proposals/' + entity.id + tab.urlSuffix"
                                    :active="$route.path.startsWith('/proposals/'+entity.id + tab.urlSuffix) && tab.urlSuffix.length !== 0"
                                    exact-active-class="active"
                                    exact
                                >
                                    <i :class="tab.icon" />
                                    {{ tab.name }}
                                </b-nav-item>
                            </b-nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <nuxt-child
            :proposal="entity"
            :visitor-station="visitorStation"
            :visitor-proposal-station="visitorProposalStation"
            @deleted="handleDeleted"
            @updated="handleUpdated"
            @proposalStationUpdated="handleProposalStationUpdated"
        />
    </div>
</template>
