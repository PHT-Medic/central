<script>
import {email, maxLength, minLength, required} from "vuelidate/lib/validators";
import {editUser} from "@/domains/user/api.ts";
import {getRealms} from "@/domains/realm/api.ts";

export default {
    props: {
        userProperty: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            form: {
                name: '',
                email: '',
                realmId: '',

                message: null,
                busy: false,
            },
            realm: {
                items: [],
                busy: false
            }
        }
    },
    validations: {
        form: {
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(30)
            },
            email: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(255),
                email
            },
            realmId: {
                required
            }
        }
    },
    created() {
        console.log(this.userProperty);
        if(typeof this.userProperty !== 'undefined') {
            this.form.name = this.userProperty.name ?? '';
            this.form.email = this.userProperty.email ?? '';
            this.form.realmId = this.userProperty.realmId ?? '';
        }

        this.loadRealms();
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
        whichFieldsAreModified(properties) {
            if(typeof this.userProperty === 'undefined') return;

            let fields = [];

            for(let property in properties) {
                if(!properties.hasOwnProperty(property)){
                    continue;
                }

                if(this.userProperty[property] !== properties[property]) {
                    fields.push(property);
                }
            }

            if(fields.length > 0) {
                return fields;
            }

            return false;
        },
        async submit() {
            if(this.form.busy || typeof this.userProperty === 'undefined') {
                return;
            }

            this.form.busy = true;

            try {
                let {name, email} = this.form;

                let fields = this.whichFieldsAreModified({name, email});

                if(fields.length > 0) {
                    const user = await editUser(this.userProperty.id, {name, email});

                    if(this.userProperty.id === this.$store.getters['auth/user'].id) {
                        await this.$store.dispatch('auth/triggerSetUserProperty',{property: 'name', value: name});
                        await this.$store.dispatch('auth/triggerSetUserProperty',{property: 'email', value: email})
                    }

                    this.$emit('updated', user);

                    this.form.message = {
                        isError: false,
                        data: 'Die Attribute wurden erfolgreich aktualisiert.'
                    }
                } else {
                    this.form.message = {
                        isError: false,
                        data: 'Die Attribute wurden nicht geändert.'
                    }
                }
            } catch (e) {
                this.form.message = {
                    isError: true,
                    data: e.message
                }
            }

            this.form.busy = false;
        },
    }
}
</script>
<template>
    <div>
        <form @submit.prevent="submit">
            <div
                v-if="form.message"
                :class="{'alert-warning': form.message.isError, 'alert-primary': !form.message.isError}"
                class="alert alert-sm">
                {{ form.message.data }}
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.form.realmId.$error }">
                <label>Realm</label>
                <select
                    v-model="$v.form.realmId.$model"
                    class="form-control"
                    :disabled="realm.busy"
                >
                    <option value="">--- Bitte auswählen ---</option>
                    <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
                </select>

                <div v-if="!$v.form.realmId.required && !$v.form.realmId.$model" class="form-group-hint group-required">
                    Bitte geben Sie einen Realm an.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.form.name.$error }">
                <label>Name</label>
                <input v-model="$v.form.name.$model" type="text" name="name" class="form-control" placeholder="Benutzer-Name...">

                <div v-if="!$v.form.name.required" class="form-group-hint group-required">
                    Bitte geben Sie einen Benutzernamen an.
                </div>
                <div v-if="!$v.form.name.minLength" class="form-group-hint group-required">
                    Der Benutzername muss mindestens <strong>{{ $v.form.name.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.form.name.maxLength" class="form-group-hint group-required">
                    Der Benutzername darf maximal <strong>{{ $v.form.name.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <hr>

            <div class="form-group" :class="{ 'form-group-error': $v.form.email.$error }">
                <label>Email</label>
                <input v-model="$v.form.email.$model" type="email" name="email" class="form-control" placeholder="Email-Addresse...">

                <div v-if="!$v.form.email.required" class="form-group-hint group-required">
                    Es muss eine E-Mail Addresse anggeben werden.
                </div>
                <div v-if="!$v.form.email.minLength" class="form-group-hint group-required">
                    Die E-Mail Addresse muss mindestens <strong>{{ $v.form.email.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.form.email.maxLength" class="form-group-hint group-required">
                    Die E-Mail Addresse darf maximal <strong>{{ $v.form.email.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.form.email.email" class="form-group-hint group-required">
                    Die E-Mail Addresse ist nicht gültig.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button :disabled="$v.form.$invalid || form.busy" @click.prevent="submit" type="submit" class="btn btn-primary btn-xs">
                    <i class="fa fa-save"></i> Speichern
                </button>
            </div>
        </form>
    </div>
</template>
