<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { Timeago } from '@vue-layout/timeago';
import type { Station } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';
import { BTable } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed, ref } from 'vue';
import {
    EntityDelete, ListPagination, ListSearch, ListTitle, StationList,
} from '@personalhealthtrain/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import { useAuthStore } from '../../../../store/auth';

export default defineNuxtComponent({
    components: {
        ListPagination,
        ListSearch,
        ListTitle,
        EntityDelete,
        BTable,
        StationList,
        Timeago,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const fields = [
            {
                key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'options', label: '', tdClass: 'text-left',
            },
        ];

        const store = useAuthStore();
        const { realmManagementId } = storeToRefs(store);

        const canView = computed(() => store.has(PermissionID.STATION_EDIT) ||
                store.has(PermissionID.STATION_DROP));

        const canDrop = computed(() => store.has(PermissionID.STATION_DROP));

        const query = computed<BuildInput<Station>>(() => ({
            filters: {
                realm_id: realmManagementId.value,
            },
        }));

        const handleDeleted = async (item: Station) => {
            emit('deleted', item);
        };

        return {
            fields,
            realmManagementId,
            canView,
            canDrop,
            query,
            handleDeleted,
        };
    },
});
</script>
<template>
    <StationList
        :query="query"
        :load-on-init="true"
        @deleted="handleDeleted"
    >
        <template #header="props">
            <ListTitle />
            <ListSearch
                :load="props.load"
                :meta="props.meta"
            />
        </template>
        <template #footer="props">
            <ListPagination
                :load="props.load"
                :meta="props.meta"
            />
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
                    <nuxt-link
                        v-if="canView"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/stations/'+data.item.id"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <EntityDelete
                        v-if="canDrop"
                        class="btn btn-xs btn-outline-danger ms-1"
                        :entity-id="data.item.id"
                        :entity-type="'station'"
                        :with-text="false"
                        @deleted="props.deleted"
                    />
                </template>
                <template #cell(created_at)="data">
                    <Timeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <Timeago :datetime="data.item.updated_at" />
                </template>
            </BTable>
        </template>
    </StationList>
</template>
