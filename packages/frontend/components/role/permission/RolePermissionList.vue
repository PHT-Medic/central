<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getRolePermissions} from "@personalhealthtrain/ui-common/src";
import RolePermissionListItemActions from "../../../components/role/permission/RolePermissionListItemActions";
import PermissionList from "../../../components/permission/PermissionList";

export default {
    components: {PermissionList, RolePermissionListItemActions},
    props: {
        roleId: Number
    },
    data() {
        return {
            meta: {
                limit: 50,
                offset: 0,
                total: 0
            },
            busy: false,
            items: [],
            assignedOnly: true,
            requestFilter: {}
        }
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                const response = await getRolePermissions({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        role_id: this.roleId
                    }
                });

                this.items = response.data;

                this.$nextTick(() => {
                    this.buildRequestFilter();
                })
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
        },

        buildRequestFilter(build) {
            const ids = this.items.map(item => item.permissionId);
            let additionFilter = undefined;

            build = build ?? this.assignedOnly;

            if(build) {
                additionFilter = {
                    id: ids.join(',')
                }
            }

            this.requestFilter = additionFilter;

            this.$nextTick(() => {
                this.$refs['roleList'].load();
            });
        },

        filterItems(item) {
            if(!this.assignedOnly) {
                return true;
            }

            return this.items.findIndex(rolePermission => rolePermission.permissionId === item.id) !== -1;
        },

        handleAdded(item) {
            const index = this.items.findIndex(rolePermission => rolePermission.id === item.id);
            if(index === -1) {
                this.items.push(item);
            }
        },
        handleDropped(item) {
            const index = this.items.findIndex(rolePermission => rolePermission.id === item.id);
            if(index !== -1) {
                this.items.splice(index, 1);
            }
        }
    }
}
</script>
<template>
    <div>
        <permission-list
            :request-filters="requestFilter"
            :filter-items="filterItems"
            :load-on-init="false"
            ref="roleList"
        >
            <template v-slot:header-title>
                <template v-if="assignedOnly">
                    Slight overview of all assigned permissions.
                </template>
                <template v-else>
                    Slight overview of all assigned and available permissions.
                </template>
            </template>
            <template v-slot:header-actions>
                <b-form-checkbox v-model="assignedOnly" @change="buildRequestFilter" :disabled="busy" switch>
                    Show only assigned roles
                </b-form-checkbox>
            </template>
            <template v-slot:item-actions="props">
                <role-permission-list-item-actions
                    :role-id="roleId"
                    :permission-id="props.item.id"
                    :role-permissions="items"
                    @added="handleAdded"
                    @dropped="handleDropped"
                />
            </template>
        </permission-list>
    </div>
</template>
