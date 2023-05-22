<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { Timeago } from '@vue-layout/timeago';
import type { Station } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { BSpinner, BTable, useToast } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed, ref } from 'vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import EntityDelete from '../../../../components/domains/EntityDelete';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import StationList from '../../../../components/domains/station/StationList';
import { useAuthStore } from '../../../../store/auth';

export default defineNuxtComponent({
    components: {
        EntityDelete,
        BTable,
        BSpinner,
        StationList,
        Timeago,
    },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const toast = useToast();

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

        const listNode = ref<null | StationList>(null);
        const handleDeleted = async (item: Station) => {
            toast.success({ body: 'The station was successfully deleted.' });

            this.$refs.itemsList.handleDeleted(item);
        };

        return {
            listNode,
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
        ref="listNode"
        :query="query"
        :load-on-init="true"
    >
        <template #header-title>
            <h6><i class="fa-solid fa-list pr-1" /> Overview</h6>
        </template>
        <template #items="props">
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
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        :entity-type="'station'"
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
    </StationList>
</template>
