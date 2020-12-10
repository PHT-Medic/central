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
            },
            message: null,
            busy: false,
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
        getModifiedFields() {
            if(typeof this.userProperty === 'undefined') return;

            let fields = {};

            for(let property in this.form) {
                if(!this.form.hasOwnProperty(property)){
                    continue;
                }

                if(this.userProperty[property] !== this.form[property]) {
                    fields[property] = this.form[property];
                }
            }

            return fields;
        },
        async updateSessionUser(fields) {
            if(this.userProperty.id !== this.$store.getters['auth/user'].id) return;

            for(let key in fields) {
                if(!fields.hasOwnProperty(key)) continue;
                await this.$store.dispatch('auth/triggerSetUserProperty', {property: key, value: fields[key]});
            }
        },
        async submit() {
            if(this.busy || typeof this.userProperty === 'undefined') {
                return;
            }

            this.busy = true;

            try {
                let fields = this.getModifiedFields();
                let fieldsCount = Object.keys(fields).length;

                if(fieldsCount > 0) {
                    const user = await editUser(this.userProperty.id, fields);

                    this.$emit('updated', user);

                    this.message = {
                        isError: false,
                        data: 'Die Attribute wurden erfolgreich aktualisiert.'
                    }

                    if(fields.hasOwnProperty('realmId')) {
                        fields.realm = user.realm;
                    }

                    await this.updateSessionUser(fields);
                } else {
                    this.message = {
                        isError: false,
                        data: 'Die Attribute wurden nicht geändert.'
                    }
                }
            } catch (e) {
                this.message = {
                    isError: true,
                    data: e.message
                }
            }

            this.busy = false;
        },
    }
}
</script>
<template>
    <div>
        <form @submit.prevent="submit">
            <div
                v-if="message"
                :class="{'alert-warning': message.isError, 'alert-primary': !message.isError}"
                class="alert alert-sm">
                {{ message.data }}
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.form.realmId.$error }">
                <label>Realm</label>
                <select
                    v-model="$v.form.realmId.$model"
                    class="form-control"
                    :disabled="realm.busy || !$auth.can('edit','user')"
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

                <div v-if="!$v.form.name.required && !$v.form.name.$model" class="form-group-hint group-required">
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
                <button :disabled="$v.form.$invalid || busy" @click.prevent="submit" type="submit" class="btn btn-primary btn-xs">
                    <i class="fa fa-save"></i> Speichern
                </button>
            </div>
        </form>
    </div>
</template>
