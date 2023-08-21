<script lang="ts">
import { BTable } from 'bootstrap-vue-next';
import type { Realm } from '@authup/core';
import { PermissionName, isRealmResourceWritable } from '@authup/core';
import { EntityDelete, RealmList } from '@authup/client-vue';
import { storeToRefs } from 'pinia';
import { ListPagination, ListSearch, ListTitle } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';
import { useAuthStore } from '../../../../store/auth';

export default defineNuxtComponent({
    components: {
        ListPagination,
        ListSearch,
        ListTitle,
        BTable,
        EntityDelete,
        RealmList,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        const store = useAuthStore();
        const {
            realm,
            realmManagementId,
        } = storeToRefs(store);

        const handleDeleted = (e: Realm) => {
            emit('deleted', e);
        };

        const isResourceWritable = (
            entity: Realm,
        ) => isRealmResourceWritable(realm.value, entity.id);

        const hasEditPermission = store.has(PermissionName.REALM_EDIT);
        const hasDropPermission = store.has(PermissionName.REALM_DROP);

        const fields = [
            {
                key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        return {
            fields,
            isResourceWritable,
            hasEditPermission,
            hasDropPermission,
            handleDeleted,
            realmManagementId,
            setRealmManagement: store.setRealmManagement,
        };
    },
});
</script>
<template>
    <RealmList
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
                    <button
                        v-if="realmManagementId !== data.item.id"
                        class="btn btn-xs btn-primary me-1"
                        @click.prevent="setRealmManagement(data.item)"
                    >
                        <i class="fa-solid fa-check" />
                    </button>
                    <NuxtLink
                        :to="'/admin/realms/'+ data.item.id"
                        class="btn btn-xs btn-outline-primary me-1"
                        :disabled="!hasEditPermission"
                    >
                        <i class="fa-solid fa-bars" />
                    </NuxtLink>
                    <EntityDelete
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        entity-type="realm"
                        :with-text="false"
                        :disabled="!data.item.built_in || !hasDropPermission"
                        @deleted="props.deleted"
                    />
                </template>
            </BTable>
        </template>
    </RealmList>
</template>
