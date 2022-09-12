<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID, Registry } from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import { RegistryProjectList } from '../../../../../../components/domains/registry-project/RegistryProjectList';
import { LayoutKey, LayoutNavigationID } from '../../../../../../config/layout';
import RegistryProjectDetails from '../../../../../../components/domains/registry-project/RegistryProjectDetails';

export default {
    components: { RegistryProjectDetails, RegistryProjectList },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
    props: {
        entity: Object as PropType<Registry>,
    },
    data() {
        return {
            query: {
                filter: {
                    registry_id: this.entity.id,
                },
                fields: ['+account_id', '+account_name', '+account_secret'],
            },
            item: null,
            fields: [
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
            ],
        };
    },
    computed: {
        canView() {
            return this.$auth.has(PermissionID.STATION_EDIT) ||
                this.$auth.has(PermissionID.STATION_DROP);
        },
        canDrop() {
            return this.$auth.has(PermissionID.STATION_DROP);
        },
    },
    methods: {
        async handleDeleted(item) {
            this.$bvToast.toast('The project was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            this.$refs.itemsList.handleDeleted(item);
        },
        showDetails(item) {
            this.item = item;
            this.$refs.modal.show();
        },
    },
};
</script>
<template>
    <div>
        <registry-project-list
            ref="itemsList"
            :query="query"
            :load-on-init="true"
        >
            <template #items="props">
                <b-table
                    :items="props.items"
                    :fields="fields"
                    :busy="props.busy"
                    head-variant="'dark'"
                    outlined
                >
                    <template #cell(type)="data">
                        <span class="badge badge-dark">
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
                            class="btn btn-xs btn-outline-dark"
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
                </b-table>
            </template>
        </registry-project-list>

        <b-modal
            ref="modal"
            size="lg"
            button-size="sm"
            :title-html="'<i class=\'fa-solid fa-diagram-project pr-1 \'></i> ' + (item ? item.name : 'Unknown') + '-Project'"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <registry-project-details
                v-if="item"
                :entity-id="item.id"
                :realm-id="item.realm_id"
            />
        </b-modal>
    </div>
</template>
