<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { storeToRefs } from 'pinia';
import { computed, toRefs } from 'vue';
import type { PropType } from 'vue';
import type { Proposal, ProposalStation } from '@personalhealthtrain/central-common';
import { defineNuxtComponent } from '#app';
import DomainEntityNav from '../../../components/DomainEntityNav';
import { useAuthStore } from '../../../store/auth';

export default defineNuxtComponent({
    components: { DomainEntityNav },
    props: {
        proposal: {
            type: Object as PropType<Proposal>,
            required: true,
        },
        visitorProposalStation: {
            type: Object as PropType<ProposalStation>,
            default: undefined,
        },
    },
    setup(props) {
        const refs = toRefs(props);

        const store = useAuthStore();
        const { realmId } = storeToRefs(store);

        const isOwner = computed(() => refs.proposal.value.realm_id === realmId.value);

        const tabs = computed(() => [
            {
                name: 'Overview', routeName: 'settings-id', icon: 'fas fa-bars', urlSuffix: '',
            },
            ...(isOwner.value ? [
                {
                    name: 'Add', routeName: 'settings-id-security', icon: 'fa fa-plus', urlSuffix: '/add',
                },
            ] : []),
        ]);

        return {
            proposal: refs.proposal,
            visitorProposalStation: refs.visitorProposalStation,
            tabs,
        };
    },
});
</script>
<template>
    <div class="content-wrapper">
        <div class="content-sidebar flex-column">
            <DomainEntityNav
                :items="tabs"
                :direction="'vertical'"
                :path="'/proposals/' + proposal.id + '/trains'"
            />
        </div>
        <div class="content-container">
            <NuxtPage
                :proposal="proposal"
                :visitor-proposal-station="visitorProposalStation"
            />
        </div>
    </div>
</template>
