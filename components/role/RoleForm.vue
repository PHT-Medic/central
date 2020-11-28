<script>
import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

import AlertMessage from "../alert/AlertMessage";
import NotImplemented from "../NotImplemented";
import {addRole, editRole} from "@/domains/role/api.ts";

export default {
    components: {
        AlertMessage,
        NotImplemented
    },
    props: {
        roleProperty: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            formData: {
                name: '',
                providerRoleId: ''
            },

            busy: false,
            message: null
        }
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30)
            },
            providerRoleId: {
                minLength: minLength(3),
                maxLength: maxLength(100)
            }
        }
    },
    created() {
        this.formData.name = this.roleProperty?.name ?? '';
        this.formData.providerRoleId = this.roleProperty?.providerRoleId ?? '';
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

                if(this.isEditing) {
                   response = await editRole(this.roleProperty.id, this.formData);

                   this.message = {
                       isError: false,
                       data: 'Die Rolle wurde erfolgreich editiert.'
                   }

                   this.$emit('updated', response);
                } else {
                    response = await addRole(this.formData);

                    this.message = {
                        isError: false,
                        data: 'Die Rolle wurde erfolgreich erstellt.'
                    }

                    this.$emit('created', response);
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
            return typeof this.roleProperty?.id === 'number';
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

            <div class="form-group" :class="{ 'form-group-error': $v.formData.providerRoleId.$error }">
                <label>Provider Rollen ID</label>
                <input v-model="$v.formData.providerRoleId.$model" type="text" name="name" class="form-control" placeholder="Keycloak Role-Name...">

                <div v-if="!$v.formData.providerRoleId.minLength" class="form-group-hint group-required">
                    Der Name muss mindestens <strong>{{ $v.formData.providerRoleId.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.formData.providerRoleId.maxLength" class="form-group-hint group-required">
                    Der Name darf maximal <strong>{{ $v.formData.providerRoleId.$params.maxLength.max }}</strong> Zeichen lang sein.
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
