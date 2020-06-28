<script>
    import {mapGetters} from "vuex";
    import AlertMessage from "../alert/AlertMessage";
    import UserPermissionEdge from "../../services/edge/user/userPermissionEdge";

    export default {
        components: {AlertMessage},
        props: {
            index: {
                type: Number
            },
            userId: {
                type: Number
            },
            referencedUserPermission: {
                type: Object,
                default() {
                    return null;
                }
            },
            permission: {
                type: Object
            }
        },
        data() {
            return {
                show: false,
                enabled: false,
                busy: false,

                userPermission: null,

                formData: {
                    power: null,
                    powerInverse: null,
                    scope: null,
                    condition: null
                },

                permissionPower: null,
                permissionPowerInverse: null,

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
                return 'permission-'+this.permission.id+'-modal';
            },
            hasExtendedOptions() {
                return this.permission.powerConfigurable || this.permission.powerInverseConfigurable || this.permission.scopeConfigurable;
            }
        },
        watch: {
            referencedUserPermission: function(newVal, oldVal) {
                if(newVal === oldVal) return;

                this.busy = true;
                this.userPermission = newVal;
                this.enabled = !!this.userPermission;
                this.busy = false;
            }
        },
        created() {
            this.busy = true;

            // Get own power ( + inverse )
            this.permissionPower = this.$permission.getPower(this.permission.name);
            this.permissionPowerInverse = this.$permission.getPowerInverse(this.permission.name);

            // Determinate max power ( + inverse )
            this.max = this.permissionPower;

            if(this.user.id === this.userId) {
                this.inverseMax = this.permissionPowerInverse;
            } else {
                this.inverseMax = this.permissionPower;
            }

            this.resetModal();

            this.busy = false;
        },
        methods: {
            async dropUserPermission() {
                if(!this.userPermission || this.busy) {
                    return;
                }

                this.busy = true;

                try {
                    await UserPermissionEdge.dropUserPermissionByRelationId(this.userId, this.userPermission.id);
                    this.userPermission = null;
                } catch (e) {
                    await this.$bvToast.toast(e.message);
                    this.enabled = true;
                }

                this.$emit('changeUserPermission', {
                    action: 'drop',
                    index: this.index,
                    data: null
                });

                this.busy = false;
            },
            async createUserPermission() {
                if(this.userPermission || this.busy) {
                    return;
                }

                this.busy = true;
                let formData = this.filterFormData();

                try {
                    let { id } = await UserPermissionEdge.addUserPermission(this.userId,{
                        ...formData,
                        permissionId: this.permission.id
                    });

                    this.userPermission = await UserPermissionEdge.getUserPermission(
                        this.userId,
                        id,
                        'self'
                    );
                } catch (e) {
                    await this.$bvToast.toast(e.message);
                    this.enabled = false;
                }

                this.$emit('changeUserPermission', {
                    action: 'add',
                    index: this.index,
                    data: this.userPermission
                });

                this.busy = false;
            },
            async editUserPermission() {
                if(!this.userPermission || this.busy) return;

                this.busy = true;
                let formData = this.filterFormData();

                try {
                    await UserPermissionEdge.editUserPermission(this.userId, this.userPermission.id, {
                        ...formData
                    });

                } catch (e) {
                    await this.$bvToast.toast(e.message);
                }

                let permission = Object.assign(this.userPermission, formData);

                this.userPermission = permission;

                this.$emit('changeUserPermission', {
                    action: 'edit',
                    index: this.index,
                    data: this.userPermission
                });

                this.busy = false;
            },

            //------------------------------------

            showModal() {
                this.$bvModal.show(this.permissionModalId);
            },
            resetModal() {
                if(this.permission.powerConfigurable) {
                    this.formData.power = this.userPermission ? this.userPermission.power : this.max;
                }

                if(this.permission.powerInverseConfigurable) {
                    this.formData.powerInverse = this.userPermission ? this.userPermission.powerInverse : this.inverseMax;
                }

                if(this.permission.scopeConfigurable) {
                    this.formData.scope = this.userPermission ? this.userPermission.scope : this.null;
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
            :title="permission.namePretty"
        >
            <form @submit.stop.prevent="handleModalSubmit">
                <div v-if="permission.powerConfigurable" class="form-group">
                    <label>Power</label>
                    <input type="number" v-model="formData.power" class="form-control" :min="min" :max="max" placeholder="Berechtigungspower wählen..." />
                </div>

                <div v-if="permission.powerInverseConfigurable" class="form-group">
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
                            v-if="userPermission && hasExtendedOptions"
                            type="button"
                            class="btn btn-xs"
                            :class="{'btn-dark': userPermission, 'btn-success': !userPermission}"
                        >
                            <i class="fa" :class="{'fa-cog': userPermission, 'fa-plus': !userPermission}"></i>
                        </button>
                    </div>
                    <h6
                        :class="{'text-primary': userPermission, 'text-muted': !userPermission}"
                        class="m-b-0 font-weight-bold d-inline"
                    >{{permission.namePretty}} <small>({{permission.name}})</small></h6>
                </div>
                <div>
                    <b-form-checkbox v-model="enabled" :disabled="busy" @change="toggleEnabled" switch />
                </div>
            </div>
        </b-list-group-item>
    </div>
</template>
