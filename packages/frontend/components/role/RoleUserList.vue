<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getApiUserRoles} from "@personalhealthtrain/ui-common";
import UserRoleListItemActions from "../user-role/UserRoleListItemActions";
import UserList from "../../components/user/UserList";

export default {
    components: {UserList, UserRoleListItemActions},
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
                const response = await getApiUserRoles({
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
                    this.buildRoleRequestFilter();
                })
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
        },

        buildRoleRequestFilter(build) {
            const ids = this.items.map(item => item.user_id);
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

            return this.items.findIndex(userRole => userRole.user_id === item.id) !== -1;
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
        <user-list
            :request-filters="requestFilter"
            :filter-items="filterItems"
            :load-on-init="false"
            ref="roleList"
        >
            <template v-slot:header-title>
                <template v-if="assignedOnly">
                    Slight overview of all assigned users.
                </template>
                <template v-else>
                    Slight overview of all assigned and available users.
                </template>
            </template>
            <template v-slot:header-actions>
                <b-form-checkbox v-model="assignedOnly" @change="buildRoleRequestFilter" :disabled="busy" switch>
                    Show only assigned users
                </b-form-checkbox>
            </template>
            <template v-slot:item-actions="props">
                <user-role-list-item-actions
                    :role-id="roleId"
                    :user-id="props.item.id"
                    :user-roles="items"
                    :primary-parameter="'user'"
                    @added="handleAdded"
                    @dropped="handleDropped"
                />
            </template>
        </user-list>
    </div>
</template>
