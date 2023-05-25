<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { DomainEventName } from '@authup/core';
import type {
    Proposal,
    ProposalEventContext,
    ProposalStation,
    SocketServerToClientEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    PermissionID,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import { storeToRefs } from 'pinia';
import type { Ref } from 'vue';
import {
    computed, onMounted, onUnmounted, ref,
} from 'vue';
import {
    definePageMeta, updateObjectProperties, useAPI, useSocket,
} from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import DomainEntityNav from '../../components/DomainEntityNav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';
import { useAuthStore } from '../../store/auth';

export default defineNuxtComponent({
    components: { DomainEntityNav },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const store = useAuthStore();
        const { realmId } = storeToRefs(store);

        const route = useRoute();

        let entity : Ref<Proposal>;
        let proposalStation : Ref<ProposalStation>;

        try {
            const response = await useAPI().proposal.getOne(route.params.id as string, {
                include: {
                    master_image: true,
                },
            });

            entity = ref(response);

            if (response.realm_id !== realmId.value) {
                const response = await useAPI().proposalStation.getMany({
                    filter: {
                        proposal_id: entity.value.id,
                        station_realm_id: realmId.value,
                    },
                });

                const data = response.data.pop();

                if (data) {
                    proposalStation = ref(data);
                }
            }
        } catch (e) {
            await navigateTo({ path: '/proposals' });
            throw createError({});
        }

        const isProposalOwner = computed(() => realmId.value === entity.value.realm_id);

        const isStationAuthority = computed(() => !!proposalStation.value);

        const backLink = computed(() => {
            if (typeof route.query.refPath === 'string') {
                return route.query.refPath;
            }

            return '/proposals';
        });

        const tabs = computed(() => {
            const items = [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },

            ];

            if (isProposalOwner.value || isStationAuthority.value) {
                items.push({ name: 'Trains', icon: 'fas fa-train', urlSuffix: '/trains' });
            }

            if (
                isProposalOwner.value &&
                store.has(PermissionID.PROPOSAL_EDIT)
            ) {
                items.push({ name: 'Settings', icon: 'fa fa-cog', urlSuffix: '/settings' });
            }

            return items;
        });

        const handleUpdated = (data: Proposal) => {
            updateObjectProperties(entity, data);
        };

        const handleDeleted = async () => {
            await navigateTo('/proposals');
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<ProposalEventContext>) => {
            if (
                entity.value.id !== context.data.id ||
                context.meta.roomId !== entity.value.id
            ) return;

            handleUpdated(context.data);
        };

        const handleSocketDeleted = (context: SocketServerToClientEventContext<ProposalEventContext>) => {
            if (
                entity.value.id !== context.data.id ||
                context.meta.roomId !== entity.value.id
            ) return;

            handleDeleted();
        };

        const socket = useSocket().useRealmWorkspace(entity.value.realm_id);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.PROPOSAL,
                DomainEventSubscriptionName.SUBSCRIBE,
            ), entity.value.id);

            socket.on(buildDomainEventFullName(
                DomainType.PROPOSAL,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);

            socket.on(buildDomainEventFullName(
                DomainType.PROPOSAL,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.PROPOSAL,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ), entity.value.id);

            socket.off(buildDomainEventFullName(
                DomainType.PROPOSAL,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);

            socket.on(buildDomainEventFullName(
                DomainType.PROPOSAL,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        return {
            entity,
            proposalStation,
            backLink,
            tabs,
            handleDeleted,
            handleUpdated,
        };
    },
});
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
                        <DomainEntityNav
                            :items="tabs"
                            :path="'/proposals/' + entity.id"
                            :prev-link="true"
                        />
                    </div>
                </div>
            </div>
        </div>

        <NuxtPage
            :proposal="entity"
            :visitor-proposal-station="proposalStation"
            @deleted="handleDeleted"
            @updated="handleUpdated"
        />
    </div>
</template>
