<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

import AlertMessage from "../../alert/AlertMessage";
import NotImplemented from "../../NotImplemented";
import {addRole, editRole} from "@/domains/role/api.ts";
import {addRealm, editRealm} from "@/domains/realm/api.ts";

export default {
    components: {
        AlertMessage,
        NotImplemented
    },
    props: {
        modeProperty: {
            type: String,
            default: 'add'
        },
        realmProperty: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            formData: {
                id: '',
                name: ''
            },

            busy: false,
            message: null
        }
    },
    validations: {
        formData: {
            id: {
                minLength: minLength(5),
                maxLength: maxLength(36)
            },
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100)
            }
        }
    },
    created() {
        this.formData.id = this.realmProperty.id ?? '';
        this.formData.name = this.realmProperty.name ?? '';
    },
    methods: {
        async handleSubmit () {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                let response;
                let formData = {
                    name: this.formData.name,
                    id: this.formData.id
                }

                if(this.isEditing) {
                    response = await editRealm(this.realmProperty.id, {name: formData.name});

                    this.message = {
                        isError: false,
                        data: 'Der Realm wurde erfolgreich editiert.'
                    }

                    this.$emit('updated', response);
                } else {
                    response = await addRealm(formData);

                    this.message = {
                        isError: false,
                        data: 'Die Realm wurde erfolgreich erstellt.'
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
            return this.modeProperty !== 'add';
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="form-group">
            <div class="form-group" :class="{ 'form-group-error': $v.formData.id.$error }">
                <label>Id</label>
                <input v-model="$v.formData.id.$model" type="text" name="id" class="form-control" :disabled="isEditing" placeholder="ID...">

                <div v-if="!$v.formData.id.required && !$v.formData.id.$model" class="form-group-hint group-required">
                    Bitte geben Sie eine ID an.
                </div>
                <div v-if="!$v.formData.id.minLength" class="form-group-hint group-required">
                    Der Name muss mindestens <strong>{{ $v.formData.id.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.formData.id.maxLength" class="form-group-hint group-required">
                    Der Name darf maximal <strong>{{ $v.formData.id.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <hr>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                <label>Name</label>
                <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Name...">

                <div v-if="!$v.formData.name.required && !$v.formData.name.$model" class="form-group-hint group-required">
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

            <div class="form-group">
                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click.prevent="handleSubmit">
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
