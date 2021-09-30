<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <div>
        <button v-if="!isAssigned" class="btn btn-xs btn-success" @click.prevent="add">
            <i class="fa fa-plus"></i>
        </button>
        <button v-if="isAssigned" class="btn btn-xs btn-danger" @click.prevent="drop">
            <i class="fa fa-trash"></i>
        </button>
    </div>
</template>
<script>
import {addRolePermission, dropRolePermission, RolePermission} from "@personalhealthtrain/ui-common";

export default {
    props: {
        role_permissions: {
            type: Array,
            default: []
        },
        primaryParameter: {
            type: String,
            default: 'permission'
        },
        role_id: Number,
        permission_id: String
    },
    data() {
        return {
            busy: false
        }
    },
    computed: {
        role_permissionIndex() {
            return this.role_permissions.findIndex(role_permission => this.primaryParameter === 'permission' ?  role_permission.permission_id === this.permission_id : role_permission.role_id === this.role_id);
        },
        isAssigned() {
            return this.role_permissionIndex !== -1;
        }
    },
    methods: {
        async add() {
            if(this.busy) return;

            this.busy = true;

            try {
                const item = await addRolePermission({
                    role_id: this.role_id,
                    permission_id: this.permission_id
                });

                this.$emit('added', item);
            } catch (e) {

            }

            this.busy = false;
        },
        async drop() {
            if(this.busy || this.role_permissionIndex === -1) return;

            this.busy = true;

            try {
                await dropRolePermission(this.role_permissions[this.role_permissionIndex].id);

                this.$emit('dropped', this.role_permissions[this.role_permissionIndex]);
            } catch (e) {

            }

            this.busy = false;
        },
    }
}
</script>
