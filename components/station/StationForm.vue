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
        },
        realmLocked: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formData: {
                name: '',
                publicKey: null,
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
            },
            publicKey: {
                minLength: minLength(10),
                maxLength: maxLength(4096)
            }
        }
    },
    watch: {
        publicKey(val) {
            this.formData.publicKey = val;
        }
    },
    created() {
        if(typeof this.stationProperty !== 'undefined') {
            this.formData.name = this.stationProperty?.name ?? '';
            this.formData.realmId = this.stationProperty?.realmId ?? '';
            this.formData.publicKey = this.stationProperty?.publicKey ?? '';
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
        },
        publicKey() {
            return this.stationProperty.publicKey;
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="form-group">
            <div v-if="!realmLocked" class="form-group" :class="{ 'form-group-error': $v.formData.realmId.$error }">
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
                    Please select a realm...
                </div>
            </div>

            <div v-if="!realmLocked" class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                <label>Name</label>
                <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Name...">

                <div v-if="!$v.formData.name.required" class="form-group-hint group-required">
                    Please provide a name...
                </div>
                <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                    The minimum length for the public key is <strong>{{ $v.formData.name.$params.minLength.min }}</strong> letters long.
                </div>
                <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                    The maximum length for the name is <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> letters long.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.publicKey.$error }">
                <label>PublicKey</label>
                <textarea
                    v-model="$v.formData.publicKey.$model"
                    class="form-control"
                    rows="4"
                    placeholder="Provide a public key for the station. The public key will also be passed to the Vault Key Storage for further usage."
                ></textarea>

                <div v-if="!$v.formData.publicKey.minLength" class="form-group-hint group-required">
                    The minimum length for the public key is <strong>{{ $v.formData.publicKey.$params.minLength.min }}</strong> letters long.
                </div>
                <div v-if="!$v.formData.publicKey.maxLength" class="form-group-hint group-required">
                    The maximum length for the public key is <strong>{{ $v.formData.publicKey.$params.maxLength.max }}</strong> letters long.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click="handleSubmit">
                    {{ isEditing ? 'Update' : 'Create' }}
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
