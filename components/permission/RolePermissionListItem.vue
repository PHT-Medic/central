<script>
import {mapGetters} from "vuex";
import AlertMessage from "../alert/AlertMessage";

import {
    addRolePermission,
    dropRolePermissionByRelationId,
    editRolePermission,
    getRolePermission
} from "@/domains/role/permission/api.ts";

export default {
        components: {AlertMessage},
        props: {
            roleIdProperty: {
                type: Number
            },
            rolePermissionProperty: {
                type: Object,
                default: undefined
            },
            permissionProperty: {
                type: Object
            }
        },
        data() {
            return {
                show: false,
                enabled: false,
                busy: false,

                rolePermission: undefined,

                formData: {
                    power: '',
                    scope: undefined,
                    condition: undefined
                },

                permissionPower: undefined,

                max: 0,
                min: 0,
                inverseMax: 0,
                inverseMin: 0
            }
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ]),
            permissionModalId() {
                return 'permission-'+this.permissionProperty.id+'-modal';
            },
            hasExtendedOptions() {
                return this.permissionProperty.powerConfigurable || this.permissionProperty.powerInverseConfigurable || this.permissionProperty.scopeConfigurable;
            }
        },
        watch: {
            rolePermissionProperty: function(newVal, oldVal) {
                if(newVal === oldVal) return;

                this.busy = true;
                this.rolePermission = newVal;
                this.enabled = !!this.rolePermission;
                this.busy = false;
            }
        },
        created() {
            this.busy = true;

            // Get own power ( + inverse )
            this.permissionPower = this.$store.getters['auth/permission'](this.permissionProperty.name) ?? undefined;

            // Determinate max power ( + inverse )
            this.max = this.permissionPower;

            this.resetModal();

            this.busy = false;
        },
        methods: {
            async dropUserPermission() {
                if(!this.rolePermission || this.busy) {
                    return;
                }

                this.busy = true;

                try {
                    await dropRolePermissionByRelationId(this.roleIdProperty, this.rolePermission.id);
                    this.enabled = false;
                } catch (e) {
                    await this.$bvToast.toast(e.message);
                    this.enabled = true;
                }

                this.$emit('changeRolePermission', {
                    action: 'drop',
                    data: {
                        id: this.rolePermission.id,
                        permissionId: this.rolePermission.permissionId
                    }
                });

                if(!this.enabled) this.rolePermission = null;
                this.busy = false;
            },
            async createUserPermission() {
                if(this.rolePermission || this.busy) {
                    return;
                }

                this.busy = true;
                let formData = this.filterFormData();

                try {
                    let { id } = await addRolePermission(this.roleIdProperty,{
                        ...formData,
                        permissionId: this.permissionProperty.id
                    });

                    this.rolePermission = await getRolePermission(
                        this.roleIdProperty,
                        id,
                        'self'
                    );
                } catch (e) {
                    await this.$bvToast.toast(e.message);
                    this.enabled = false;
                }

                this.$emit('changeRolePermission', {
                    action: 'add',
                    data: this.rolePermission
                });

                this.busy = false;
            },
            async editUserPermission() {
                if(!this.rolePermission || this.busy) return;

                this.busy = true;
                let formData = this.filterFormData();

                try {
                    await editRolePermission(this.roleIdProperty, this.rolePermission.id, {
                        ...formData
                    });

                } catch (e) {
                    await this.$bvToast.toast(e.message);
                }

                this.rolePermission = Object.assign(this.rolePermission, formData);

                this.$emit('changeRolePermission', {
                    action: 'edit',
                    data: this.rolePermission
                });

                this.busy = false;
            },

            //------------------------------------

            showModal() {
                this.$bvModal.show(this.permissionModalId);
            },
            resetModal() {
                if(this.permissionProperty.powerConfigurable) {
                    this.formData.power = this.rolePermission ? this.rolePermission.power : this.max;
                }

                if(this.permissionProperty.powerInverseConfigurable) {
                    this.formData.powerInverse = this.rolePermission ? this.rolePermission.powerInverse : this.inverseMax;
                }

                if(this.permissionProperty.scopeConfigurable) {
                    this.formData.scope = this.rolePermission ? this.rolePermission.scope : this.null;
                }
            },
            //------------------------------------

            toggleEnabled() {
                if(this.busy) return;

                this.enabled = !this.enabled;

                if(this.hasExtendedOptions) {
                    this.showModal();
                } else {
                    if(this.enabled) {
                        this.createUserPermission();
                    } else {
                        this.dropUserPermission();
                    }
                }
            },

            //------------------------------------

            handleModalOk(event) {
                event.preventDefault();

                this.handleModalSubmit();
            },
            handleModalSubmit() {
                this.$nextTick(() => {
                    this.$bvModal.hide(this.permissionModalId);
                })
            },

            //------------------------------------

            filterFormData() {
                let formData = {};

                for(let key in this.formData) {
                    if(!this.formData.hasOwnProperty(key)) {
                        return;
                    }

                    if(
                        this.formData[key] !== null &&
                        typeof this.formData[key] !== 'undefined'
                    ) {
                        formData[key] = this.formData[key];
                    }
                }

                return formData;
            }
        }
    }
</script>
<template>
    <div>
        <b-modal
            :id="permissionModalId"
            @ok="handleModalOk"
            @hidden="resetModal"
            @show="resetModal"
            size="lg"
            button-size="xs"
            :title="permissionProperty.namePretty"
        >
            <form @submit.stop.prevent="handleModalSubmit">
                <div v-if="permissionProperty.powerConfigurable" class="form-group">
                    <label>Power</label>
                    <input type="number" v-model="formData.power" class="form-control" :min="min" :max="max" placeholder="Berechtigungspower wählen..." />
                </div>

                <div v-if="permissionProperty.powerInverseConfigurable" class="form-group">
                    <label>Inverse Power</label>
                    <input type="number" v-model="formData.powerInverse" class="form-control" :min="inverseMin" :max="inverseMax" placeholder="Berechtigungspower wählen..." />
                </div>
            </form>
            <template v-slot:modal-footer="{ok, cancel, hide }">
                <button type="button" class="btn btn-primary btn-xs" @click="ok">
                    <i class="fa fa-save"></i> Speichern
                </button>
                <button type="button" class="btn btn-xs btn-secondary" @click="cancel">
                    <i class="fa fa-times"></i> Abbrechen
                </button>
            </template>
        </b-modal>
        <b-list-group-item class="flex-column align-items-start list-group-item-sm">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="align-items-center">
                    <div
                        class="d-inline"
                        style="margin-right: 10px;"
                    >
                        <button
                            @click="showModal"
                            v-if="rolePermission && hasExtendedOptions"
                            type="button"
                            class="btn btn-xs"
                            :class="{'btn-dark': rolePermission, 'btn-success': !rolePermission}"
                        >
                            <i class="fa" :class="{'fa-cog': rolePermission, 'fa-plus': !rolePermission}"></i>
                        </button>
                    </div>
                    <h6
                        :class="{'text-primary': rolePermission, 'text-muted': !rolePermission}"
                        class="m-b-0 font-weight-bold d-inline"
                    >{{ permissionProperty.namePretty }} <small>({{ permissionProperty.name }})</small></h6>
                </div>
                <div>
                    <b-form-checkbox v-model="enabled" :disabled="busy" @change="toggleEnabled" switch />
                </div>
            </div>
        </b-list-group-item>
    </div>
</template>
