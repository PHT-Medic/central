<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getApiUserRoles} from "@/domains/user/role/api";
import RoleList from "@/components/role/RoleList";
import UserRoleListItemActions from "@/components/user/role/UserRoleListItemActions";

export default {
    components: {UserRoleListItemActions, RoleList},
    props: {
        userId: Number
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
            roleRequestFilter: {}
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
                const response = await getApiUserRoles({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        user_id: this.userId
                    }
                });

                this.items = response.data;

                this.$nextTick(() => {
                    this.buildRoleRequestFilter();
                })
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
        },

        buildRoleRequestFilter(build) {
            const ids = this.items.map(item => item.roleId);
            let additionFilter = undefined;

            build = build ?? this.assignedOnly;

            if(build) {
                additionFilter = {
                    id: ids.join(',')
                }
            }

            this.roleRequestFilter = additionFilter;

            this.$nextTick(() => {
                this.$refs['roleList'].load();
            });
        },

        filterItems(item) {
            if(!this.assignedOnly) {
                return true;
            }

            return this.items.findIndex(userRole => userRole.roleId === item.id) !== -1;
        },

        handleAdded(item) {
            const index = this.items.findIndex(userRole => userRole.id === item.id);
            if(index === -1) {
                this.items.push(item);
            }
        },
        handleDropped(item) {
            const index = this.items.findIndex(userRole => userRole.id === item.id);
            if(index !== -1) {
                this.items.splice(index, 1);
            }
        }
    }
}
</script>
<template>
    <div>
        <role-list
            :request-filters="roleRequestFilter"
            :filter-items="filterItems"
            :load-on-init="false"
            ref="roleList"
        >
            <template v-slot:header-title>
                <template v-if="assignedOnly">
                    Slight overview of all assigned roles.
                </template>
                <template v-else>
                    Slight overview of all assigned and available roles.
                </template>
            </template>
            <template v-slot:header-actions>
                <b-form-checkbox v-model="assignedOnly" @change="buildRoleRequestFilter" :disabled="busy" switch>
                    Show only assigned roles
                </b-form-checkbox>
            </template>
            <template v-slot:item-actions="props">
                <user-role-list-item-actions
                    :role-id="props.item.id"
                    :user-id="userId"
                    :user-roles="items"
                    @added="handleAdded"
                    @dropped="handleDropped"
                />
            </template>
        </role-list>
    </div>
</template>
