<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    DomainType,
} from '@personalhealthtrain/core';
import { TrainName, createEntityManager } from '@personalhealthtrain/client-vue';
import { useToast } from 'bootstrap-vue-next';
import { isClientErrorWithStatusCode } from 'hapic';
import { definePageMeta } from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import DomainEntityNav from '../../components/DomainEntityNav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineNuxtComponent({
    components: { DomainEntityNav, TrainName },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();

        const manager = createEntityManager({
            type: `${DomainType.TRAIN}`,
            props: {
                entityId: useRoute().params.id as string,
            },
            onFailed(e) {
                if (toast) {
                    toast.show({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            if (isClientErrorWithStatusCode(manager.error, 404)) {
                await navigateTo({
                    path: '/trains',
                });
            }

            throw createError({});
        }

        const tabs = [
            { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
            { name: 'Setup', icon: 'fa fa-wrench', urlSuffix: '/setup' },
        ];

        return {
            tabs,
            entity: manager.data,
            handleFailed: manager.failed,
            handleUpdated: manager.updated,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            🚊 Train
            <span class="sub-title">
                <template v-if="entity">
                    <TrainName
                        :entity-id="entity.id"
                        :entity-name="entity.name"
                    />
                </template>
                <template v-else>
                    ...
                </template>
            </span>
        </h1>

        <div
            v-if="entity"
            class="m-b-20 m-t-10"
        >
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex align-items-center">
                        <DomainEntityNav
                            :prev-link="true"
                            :items="tabs"
                            :path="'/trains/' + entity.id"
                        />
                    </div>
                </div>
            </div>
        </div>

        <template v-if="entity">
            <NuxtPage
                :entity="entity"
                @updated="handleUpdated"
                @failed="handleFailed"
            />
        </template>
        <template v-else>
            Not found...
        </template>
    </div>
</template>
