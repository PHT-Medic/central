<script>
import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

import AlertMessage from "../alert/AlertMessage";
import NotImplemented from "../NotImplemented";
import {addRole, editRole} from "@/domains/role/api.js";

export default {
    components: {
        AlertMessage,
        NotImplemented
    },
    props: {
        roleProperty: {
            type: Object,
            default: {
                id: null,
                name: '',
                keycloakRoleId: ''
            }
        }
    },
    data() {
        return {
            formData: {
                name: '',
                keycloakRoleId: ''
            },

            busy: false,
            message: null
        }
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(30)
            },
            keycloakRoleId: {
                minLength: minLength(5),
                maxLength: maxLength(30)
            }
        }
    },
    created() {
        this.formData.name = this.roleProperty.name ?? '';
        this.formData.keycloakRoleId = this.roleProperty.keycloak_role_id ?? '';
    },
    methods: {
        async handleSubmit (e) {
            e.preventDefault();

            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                let response;
                let formData = {
                    name: this.formData.name,
                    keycloak_role_id: this.formData.keycloakRoleId
                }

                if(this.isEditing) {
                   response = await editRole(this.roleProperty.id, formData);

                   this.message = {
                       isError: false,
                       data: 'Die Rolle wurde erfolgreich editiert.'
                   }

                   this.$emit('roleUpdated', {
                       id: this.roleProperty.id,
                       ...formData
                   });
                } else {
                    response = await addRole(formData);

                    this.message = {
                        isError: false,
                        data: 'Die Rolle wurde erfolgreich erstellt.'
                    }

                    this.$emit('roleCreated', {
                        id: response.id,
                        ...formData
                    });
                }


            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true
                }
            }

            this.busy = false;
        }
    },
    computed: {
        isEditing() {
            return typeof this.roleProperty.id === 'number';
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="form-group">
            <div class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                <label>Name</label>
                <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Rollen-Name...">

                <div v-if="!$v.formData.name.required" class="form-group-hint group-required">
                    Bitte geben Sie einen Namen an.
                </div>
                <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                    Der Name muss mindestens <strong>{{ $v.formData.name.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                    Der Name darf maximal <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <hr>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.keycloakRoleId.$error }">
                <label>Keycloak ID</label>
                <input v-model="$v.formData.keycloakRoleId.$model" type="text" name="name" class="form-control" placeholder="Keycloak Role-Name...">

                <div v-if="!$v.formData.keycloakRoleId.minLength" class="form-group-hint group-required">
                    Der Name muss mindestens <strong>{{ $v.formData.keycloakRoleId.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.formData.keycloakRoleId.maxLength" class="form-group-hint group-required">
                    Der Name darf maximal <strong>{{ $v.formData.keycloakRoleId.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click="handleSubmit">
                    {{ isEditing ? 'Aktualisieren' : 'Erstellen' }}
                </button>
            </div>
        </div>
    </div>
</template>
<style>
.list-group-item {
    padding: .45rem .65rem;
}
</style>
