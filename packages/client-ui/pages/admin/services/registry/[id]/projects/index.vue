<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Registry, RegistryProject } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';
import { BModal, BTable, useToast } from 'bootstrap-vue-next';
import type { BuildInput } from 'rapiq';
import { computed, ref, toRefs } from 'vue';
import type { PropType, Ref } from 'vue';
import { EntityDelete, RegistryProjectDetails, RegistryProjectList } from '@personalhealthtrain/client-vue';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../../../config/layout';
import { useAuthStore } from '../../../../../../store/auth';

export default {
    components: {
        BModal,
        BTable,
        EntityDelete,
        RegistryProjectDetails,
        RegistryProjectList,
    },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    setup(props) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const toast = useToast();
        const refs = toRefs(props);

        const query : BuildInput<RegistryProject> = {
            filter: {
                registry_id: refs.entity.value.id,
            },
            fields: ['+account_id', '+account_name', '+account_secret'],
        };

        const fields = [
            {
                key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'type', label: 'Type', thClass: 'text-left', tdClass: 'text-left',
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

        const canView = computed(() => store.has(PermissionID.STATION_EDIT) ||
                store.has(PermissionID.STATION_DROP));

        const canDrop = computed(() => store.has(PermissionID.STATION_DROP));

        const listNode = ref<null | RegistryProjectList>(null);

        const handleDeleted = (item: RegistryProject) => {
            toast.success({ body: 'The project was successfully deleted.' });

            if (listNode.value) {
                listNode.value.handleDeleted(item);
            }
        };

        const modalShow = ref<boolean>(false);
        const item : Ref<RegistryProject | null> = ref(null);

        const showDetails = (el: RegistryProject) => {
            item.value = el;

            modalShow.value = true;
        };

        return {
            canView,
            canDrop,
            handleDeleted,
            fields,
            query,
            item,
            modalShow,
            listNode,
            showDetails,
        };
    },
};
</script>
<template>
    <div>
        <registry-project-list
            ref="listNode"
            :query="query"
            :load-on-init="true"
        >
            <template #body="props">
                <BTable
                    :items="props.data"
                    :fields="fields"
                    :busy="props.busy"
                    head-variant="'dark'"
                    outlined
                >
                    <template #cell(type)="data">
                        <span class="badge bg-dark">
                            {{ data.item.type }}
                        </span>
                    </template>
                    <template #cell(options)="data">
                        <nuxt-link
                            v-if="canView"
                            class="btn btn-xs btn-outline-primary"
                            :to="'/admin/services/registry/'+entity.id+'/projects/'+data.item.id"
                        >
                            <i class="fa fa-bars" />
                        </nuxt-link>
                        <button
                            type="button"
                            class="btn btn-xs btn-outline-dark ms-1 me-1"
                            @click.prevent="showDetails(data.item)"
                        >
                            <i class="fa-solid fa-info" />
                        </button>
                        <entity-delete
                            v-if="canDrop"
                            class="btn btn-xs btn-outline-danger"
                            :entity-id="data.item.id"
                            :entity-type="'registryProject'"
                            :with-text="false"
                            @deleted="handleDeleted"
                        />
                    </template>
                    <template #cell(created_at)="data">
                        <timeago :datetime="data.item.created_at" />
                    </template>
                    <template #cell(updated_at)="data">
                        <timeago :datetime="data.item.updated_at" />
                    </template>
                    <template #table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle" />
                            <strong>Loading...</strong>
                        </div>
                    </template>
                </BTable>
            </template>
        </registry-project-list>

        <BModal
            v-model="modalShow"
            size="lg"
            button-size="sm"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <template #title>
                <i class="fa-solid fa-diagram-project" /> {{ item ? item.name : 'Unknown' }}
            </template>
            <RegistryProjectDetails
                v-if="item"
                :key="item.id"
                :entity-id="item.id"
                :realm-id="item.realm_id"
            />
        </BModal>
    </div>
</template>
