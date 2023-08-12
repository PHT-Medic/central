<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type {
    Proposal,
    ProposalStation,
} from '@personalhealthtrain/central-common';
import {
    DomainType,
    PermissionID,
} from '@personalhealthtrain/central-common';
import { createEntityManager } from '@personalhealthtrain/client-vue';
import { useToast } from 'bootstrap-vue-next';
import type { Ref } from 'vue';
import {
    computed, ref,
} from 'vue';
import {
    definePageMeta, useAPI,
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

        const toast = useToast();

        const manager = createEntityManager({
            type: `${DomainType.PROPOSAL}`,
            props: {
                entityId: useRoute().params.id as string,
            },
            onUpdated() {
                if (toast) {
                    toast.success({ body: 'The proposal was successfully updated.' });
                }
            },
            onFailed(e) {
                if (toast) {
                    toast.show({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            },
            onDeleted() {
                return navigateTo('/proposals');
            },
        });

        await manager.resolve();

        if (!manager.entity.value) {
            await navigateTo({ path: '/proposals' });
            throw createError({});
        }

        const store = useAuthStore();

        const proposalStation : Ref<ProposalStation | null> = ref(null);

        if (manager.entity.value.realm_id !== store.realmId) {
            const response = await useAPI().proposalStation.getMany({
                filter: {
                    proposal_id: manager.entity.value.id,
                    station_realm_id: store.realmId,
                },
            });

            const data = response.data.pop();

            if (data) {
                proposalStation.value = data;
            }
        }

        // todo: maybe ref of store.realmId
        const isProposalOwner = computed(() => manager.entity.value && store.realmId === manager.entity.value.realm_id);

        const isStationAuthority = computed(() => !!proposalStation.value);

        const route = useRoute();
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
            manager.updated(data);
        };

        const handleDeleted = async () => {
            manager.deleted();
        };

        return {
            entity: manager.entity.value,
            proposalStation: proposalStation.value,
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
