<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <div>
        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <b-nav
                    pills
                    vertical
                >
                    <b-nav-item
                        v-for="(item,key) in sidebar.items"
                        :key="key"
                        :disabled="item.active"
                        :to="'/proposals/' + proposal.id + '/trains' + item.urlSuffix"
                        exact
                        exact-active-class="active"
                    >
                        <i :class="item.icon" />
                        {{ item.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child
                    :proposal="proposal"
                    :visitor-proposal-station="visitorProposalStation"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { PropType } from 'vue';
import { Proposal, ProposalStation } from '@personalhealthtrain/central-common';

export default {
    props: {
        proposal: Object as PropType<Proposal>,
        visitorProposalStation: {
            type: Object as PropType<ProposalStation>,
            default: undefined,
        },
    },
    data() {
        return {
            sidebar: {
                items: [],
            },
        };
    },
    computed: {
        isOwner() {
            return this.proposal.realm_id === this.$store.getters['auth/userRealmId'];
        },
    },
    created() {
        this.fillSidebar();
    },
    methods: {
        fillSidebar() {
            const items = [
                {
                    name: 'Overview', routeName: 'settings-id', icon: 'fas fa-bars', urlSuffix: '',
                },
            ];

            if (this.isOwner) {
                items.push({
                    name: 'Add', routeName: 'settings-id-security', icon: 'fa fa-plus', urlSuffix: '/add',
                });
            }

            this.sidebar.items = items;
        },
    },
};
</script>
