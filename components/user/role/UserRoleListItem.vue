<script>
import {
    addUserRole,
    dropUserRoleByRelationId,
    dropUserRoleByResourceId,
    getApiUserRole
} from "@/domains/user/role/api.ts";

export default {
    props: {
        role: {
            type: Object,
            default: {}
        },
        user: {
            type: Object,
            default: {}
        },
        isOwnerView: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            userRoleRelation: {
                item: undefined,
                busy: false
            }
        }
    },
    created() {
        if(!this.isOwnerView) {
            this.loadRelation();
        }
    },
    methods: {
        async loadRelation() {
            if(this.userRoleRelation.busy) return;

            this.userRoleRelation.item = undefined;
            this.userRoleRelation.busy = true;

            try {
                this.userRoleRelation.item = await getApiUserRole(this.user.id, this.role.id, 'self');
                this.userRoleRelation.busy = false;
            } catch (e) {
                this.userRoleRelation.busy = false;
            }
        },
        async toggleRelation() {
            if(this.relationExists) {
                await this.dropRelation();
            } else {
                await this.addRelation();
            }
        },
        async addRelation() {
            if(this.userRoleRelation.busy || this.isOwnerView) return;

            this.userRoleRelation.busy = true;

            try {
                this.userRoleRelation.item = await addUserRole(this.user.id, {
                    roleId: this.role.id
                });

                this.$emit('created', this.user);

                this.userRoleRelation.busy = false;
            } catch (e) {
                this.userRoleRelation.busy = false;
            }
        },
        async dropRelation() {
            if(this.userRoleRelation.busy) return;

            this.userRoleRelation.busy = true;

            try {
                if(this.isOwnerView) {
                    await dropUserRoleByResourceId(this.user.id, this.role.id);
                } else {
                    await dropUserRoleByRelationId(this.user.id, this.userRoleRelation.item.id);
                    this.userRoleRelation.item = undefined;
                }

                this.$emit('deleted', this.user)

                this.userRoleRelation.busy = false;
            } catch (e) {
                this.userRoleRelation.busy = false;
            }
        }
    },
    computed: {
        relationExists() {
            return this.isOwnerView || typeof this.userRoleRelation.item !== 'undefined';
        }
    }
}
</script>
<template>
    <div>
        <b-list-group-item class="flex-column align-items-start list-group-item-sm">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                    <slot v-bind:user="user" v-bind:role="role" v-bind:relationExists="relationExists">
                        <v-gravatar style="width:40px;" class="img-thumbnail rounded-circle" :email="user.email ? user.email : ''" />
                        <h6
                            :class="{'text-primary': relationExists, 'text-muted': !relationExists}"
                            class="m-b-0 ml-1 font-weight-bold d-inline"
                        >{{ user.name }}</h6>

                        <div class="badge badge-dark ml-2">{{user.realmId}}</div>
                    </slot>
                </div>
                <div>
                    <b-form-checkbox :checked="relationExists" :disabled="userRoleRelation.busy" @change="toggleRelation" switch />
                </div>
            </div>
        </b-list-group-item>
    </div>
</template>
