<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { Timeago } from '@vue-layout/timeago';
import type { Registry } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { BSpinner, BTable } from 'bootstrap-vue-next';
import type { BuildInput } from 'rapiq';
import { computed, ref } from 'vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import EntityDelete from '../../../../../components/domains/EntityDelete';
import RegistryList from '../../../../../components/domains/registry/RegistryList';
import { useAuthStore } from '../../../../../store/auth';

export default defineNuxtComponent({
    components: {
        BSpinner, BTable, EntityDelete, RegistryList, Timeago,
    },
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const fields = [
            {
                key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        const query : BuildInput<Registry> = {
            sort: {
                updated_at: 'DESC',
            },
        };

        const store = useAuthStore();
        const canManage = computed(() => store.has(PermissionID.REGISTRY_MANAGE));

        const registryNode = ref<RegistryList | null>(null);

        const handleDeleted = (item: Registry) => {
            emit('deleted', item);

            if (registryNode.value) {
                registryNode.value.handleDeleted(item);
            }
        };

        return {
            fields,
            query,
            canManage,
            registryNode,
            handleDeleted,
        };
    },
});
</script>
<template>
    <RegistryList
        ref="registryNode"
        :load-on-init="true"
        :query="query"
    >
        <template #headerTitle>
            <h6><i class="fa-solid fa-list pe-1" /> Overview</h6>
        </template>
        <template #body="props">
            <BTable
                :items="props.data"
                :fields="fields"
                :busy="props.busy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(options)="data">
                    <NuxtLink
                        v-if="canManage"
                        v-b-tooltip="'Overview'"
                        :to="'/admin/services/registry/'+data.item.id"
                        class="btn btn-xs btn-outline-primary"
                    >
                        <i class="fa fa-bars" />
                    </NuxtLink>
                    <EntityDelete
                        v-if="canManage"
                        class="btn btn-xs btn-outline-danger ms-1"
                        :entity-id="data.item.id"
                        :entity-type="'registry'"
                        :with-text="false"
                        @deleted="handleDeleted"
                    />
                </template>
                <template #cell(created_at)="data">
                    <Timeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <Timeago :datetime="data.item.updated_at" />
                </template>
                <template #table-busy>
                    <div class="text-center text-danger my-2">
                        <BSpinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </BTable>
        </template>
    </RegistryList>
</template>
