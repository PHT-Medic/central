<script>
import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

import AlertMessage from "../alert/AlertMessage";
import NotImplemented from "../NotImplemented";
import {addStation, editStation} from "@/domains/station/api.ts";
import {getRealms} from "@/domains/realm/api.ts";

export default {
    components: {
        AlertMessage,
        NotImplemented
    },
    props: {
        stationProperty: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            formData: {
                name: '',
                realmId: ''
            },

            busy: false,
            message: null,

            realm: {
                items: [],
                busy: false
            }
        }
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30)
            },
            realmId: {
                required
            }
        }
    },
    created() {
        if(typeof this.stationProperty !== 'undefined') {
            this.formData.name = this.stationProperty?.name ?? '';
            this.formData.realmId = this.stationProperty?.realmId ?? '';
        }

        this.loadRealms()
    },
    methods: {
        async loadRealms() {
            try {
                this.realm.items = await getRealms();
                this.realm.busy = false;
            }  catch (e) {
                await this.$bvToast.toast(e.message);
                this.realm.busy = false;
            }
        },
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
                    response = await editStation(this.stationProperty.id, this.formData);

                    this.message = {
                        isError: false,
                        data: 'Die Station wurde erfolgreich editiert.'
                    }

                    this.$emit('updated', response);
                } else {
                    response = await addStation(this.formData);

                    this.message = {
                        isError: false,
                        data: 'Die Station wurde erfolgreich erstellt.'
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
        },
        handleRealmChanged() {
            if(this.$v.formData.name && this.$v.formData.name.length > 0) return;

            const index = this.realm.items.findIndex(realm => realm.id === this.$v.formData.realmId.$model);
            if(index !== -1) {
                this.formData.name = this.realm.items[index].name;
            }
        }
    },
    computed: {
        isEditing() {
            return typeof this.stationProperty?.id === 'number';
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="form-group">
            <div class="form-group" :class="{ 'form-group-error': $v.formData.realmId.$error }">
                <label>Realm</label>
                <select
                    v-model="$v.formData.realmId.$model"
                    class="form-control"
                    :disabled="realm.busy"
                    @change="handleRealmChanged"
                >
                    <option value="">--- Bitte auswählen ---</option>
                    <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
                </select>

                <div v-if="!$v.formData.realmId.required && !$v.formData.realmId.$model" class="form-group-hint group-required">
                    Bitte geben Sie einen Realm an.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                <label>Name</label>
                <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Name...">

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
