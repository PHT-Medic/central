<script>
    import UserPermissionListItem from "./UserPermissionListItem";
    import PermissionEdge from "../../services/edge/permission/permissionEdge";
    import UserPermissionEdge from "../../services/edge/user/userPermissionEdge";
    import AlertMessage from "../alert/AlertMessage";
    export default {
        components: {
            AlertMessage,
            UserPermissionListItem
        },
        props: {
            userId: {
                type: Number
            },
            userPermissions: {
                type: Array,
                default() {
                    return null;
                }
            },
            permissions: {
                type: Array,
                default() {
                    return null;
                }
            }
        },
        data() {
            return {
                q: '',

                permission: {
                    items: [],
                    busy:false
                },
                userPermission: {
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
                if(this.permissions === null || typeof this.permissions === 'undefined') {
                    await this.getPermissions();
                } else {
                    this.permission.items = this.permissions;
                }

                if(this.userPermissions === null || typeof this.permissions === 'undefined') {
                    await this.getUserPermissions();
                } else {
                    this.userPermission.items = this.userPermissions;
                }
            },

            async getPermissions() {
                if(this.permission.busy) return;

                this.message = null;
                this.permission.busy = true;

                let permissions = [];

                try {
                    permissions = await PermissionEdge.getPermissions();

                    this.permission.items = permissions;
                } catch (e) {
                    this.message = {
                        data: e.message,
                        isError: true
                    };
                }

                this.permission.busy = false;
            },
            async getUserPermissions() {
                if(this.userPermission.busy) return ;

                this.message = null;
                this.userPermission.busy = true;

                let userPermissions = [];

                try {
                    userPermissions = await UserPermissionEdge.getUserPermissions(this.userId, 'self');

                    this.userPermission.items = userPermissions;

                } catch (e) {
                    this.message = {
                        data: e.message,
                        isError: true
                    };
                }

                this.userPermission.busy = false;
            },
            changeUserPermission(data) {
                switch (data.action) {
                    case 'add':
                        this.userPermission.items.push(data.data);
                        break;
                    case 'edit':
                        this.userPermission.items[data.index] = data.data;
                        break;
                    case 'drop':
                        console.log(data.index);
                        this.userPermission.items.splice(data.index, 1);
                        break;
                }
            }
        },
        computed: {
            items: function () {
                return this.permission.items
                    .filter((permission) => {
                        let q = this.q.toLowerCase().trim();
                        return q.length >= 2 ? permission.name.toLowerCase().indexOf(q) > -1 || permission.namePretty.toLowerCase().indexOf(q) > -1 : true;
                    })
                    .map((permission) => {
                        let index = this.userPermission.items.findIndex((userPermission) => {
                            return userPermission.permissionId === permission.id;
                        });

                        let item = {
                            index,
                            permission,
                            userPermission: null
                        }

                        if(index > -1) {
                            item.userPermission = this.userPermission.items[index];
                        }

                        return item;
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
                <user-permission-list-item
                    v-for="(item,key) in items"
                    :key="key"
                    :index="item.index"
                    :permission="item.permission"
                    :referenced-user-permission="item.userPermission"
                    :user-id="userId"
                    @changeUserPermission="changeUserPermission"
                />
            </b-list-group>
        </vue-scroll>
    </div>
</template>
