<script>
    import Vue from 'vue';
    import RolePermissionListItem from "./RolePermissionListItem";
    import AlertMessage from "../alert/AlertMessage";
    import {getRolePermissions} from "@/domains/role/permission/api.ts";
    import {getPermissions} from "@/domains/permission/api.ts";

    export default {
        components: {
            AlertMessage,
            RolePermissionListItem
        },
        props: {
            roleIdProperty: {
                type: Number
            },
            rolePermissionsProperty: {
                type: Array,
                default: undefined
            },
            permissionsProperty: {
                type: Array,
                default: undefined
            }
        },
        data() {
            return {
                q: '',

                permission: {
                    items: [],
                    busy:false
                },
                rolePermissions: {},
                rolePermissionsBusy: false,
                rolePermission: {
                    items: [],
                    busy: false
                },

                message: null
            }
        },
        created() {
            this.init();
        },
        methods: {
            async init() {
                if(this.permissionsProperty === null || typeof this.permissionsProperty === 'undefined') {
                    await this.loadPermissions();
                } else {
                    this.permission.items = this.permissionsProperty;
                }

                if(this.rolePermissionsProperty === null || typeof this.rolePermissionsProperty === 'undefined') {
                    await this.loadRolePermissions();
                } else {
                    this.setRolePermissions(this.rolePermissionsProperty);
                }
            },

            async loadPermissions() {
                if(this.permission.busy) return;

                this.message = null;
                this.permission.busy = true;

                let permissions = [];

                try {
                    permissions = await getPermissions();

                    this.permission.items = permissions;
                } catch (e) {
                    this.message = {
                        data: e.message,
                        isError: true
                    };
                }

                this.permission.busy = false;
            },
            async loadRolePermissions() {
                if(this.rolePermissionsBusy) return ;

                this.message = null;
                this.rolePermissionsBusy = true;

                try {
                    let rolePermissions = await getRolePermissions(this.roleIdProperty, 'self');
                    this.setRolePermissions(rolePermissions);
                } catch (e) {
                    this.message = {
                        data: e.message,
                        isError: true
                    };
                }

                this.rolePermissionsBusy = false;
            },
            setRolePermissions(rolePermissions) {
                for(let i=0; i<rolePermissions.length; i++) {
                    Vue.set(this.rolePermissions, rolePermissions[i].permissionId, rolePermissions[i]);
                }
            },
            handleRolePermissionCreated(data) {
                Vue.set(this.rolePermissions, data.permissionId, data);
            },
            handleRolePermissionUpdated(data) {
                Object.assign(this.rolePermissions[data.permissionId], data);
            },
            handleRolePermissionDeleted(data) {
                Vue.set(this.rolePermissions, data.permissionId, undefined);
            }
        },
        computed: {
            items: function () {
                return this.permission.items
                    .filter((permission) => {
                        let q = this.q.toLowerCase().trim();
                        return q.length >= 2 ? permission.name.toLowerCase().indexOf(q) > -1 || permission.namePretty.toLowerCase().indexOf(q) > -1 : true;
                    });
            }
        }
    }
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="form-group">
            <div class="input-group">
                <label for="permission-q"></label>
                <input v-model="q" type="text" name="q" id="permission-q" class="form-control" placeholder="Name..." autocomplete="new-password" />
                <div class="input-group-append">
                    <span class="input-group-text"><i class="fa fa-search"></i></span>
                </div>
            </div>
        </div>

        <vue-scroll style="height:500px">
            <b-list-group>
                <role-permission-list-item
                    v-for="(item,key) in items"
                    :key="key"
                    :permission-property="item"
                    :role-permission-property="rolePermissions[item.id]"
                    :role-id-property="roleIdProperty"
                    @created="handleRolePermissionCreated"
                    @updated="handleRolePermissionUpdated"
                    @deleted="handleRolePermissionDeleted"
                />
            </b-list-group>
        </vue-scroll>
    </div>
</template>
