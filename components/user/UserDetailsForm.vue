<script>
import {mapActions, mapGetters} from "vuex";
import {email, maxLength, minLength, required, numeric} from "vuelidate/lib/validators";
import {editUser} from "@/domains/user/api.ts";
import {getRealms} from "@/domains/realm/api.ts";

export default {
    props: {
        userProperty: {
            type: Object,
            default: undefined
        }
    },
    computed: {
        ...mapGetters('auth', [
            'loggedIn',
            'user'
        ])
    },
    data() {
        return {
            userGeneralForm: {
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
        userGeneralForm: {
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
            this.userGeneralForm.name = this.userProperty.name ?? '';
            this.userGeneralForm.email = this.userProperty.email ?? '';
            this.userGeneralForm.realmId = this.userProperty.realmId ?? '';
        }

        this.loadRealms();
    },
    methods: {
        ...mapActions('auth',[
            'triggerSetUserProperty'
        ]),
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

                switch (property) {
                    default:
                        if(this.userProperty[property] !== properties[property]) {
                            fields.push(property);
                        }
                        break;
                }
            }

            if(fields.length > 0) {
                return fields;
            }

            return false;
        },
        async submitGeneralForm() {
            if(this.userGeneralForm.busy || typeof this.userProperty === 'undefined') {
                return;
            }

            this.userGeneralForm.busy = true;

            try {
                let {name, email} = this.userGeneralForm;

                let fields = this.whichFieldsAreModified({name, email});

                if(fields.length > 0) {
                    await editUser(this.userProperty.id, {name, email});

                    if(this.userProperty.id === this.user.id) {
                        this.triggerSetUserProperty({property: 'name', value: name});
                        this.triggerSetUserProperty({property: 'email', value: email})
                    }

                    this.$emit('userUpdated', {name, email});

                    this.userGeneralForm.message = {
                        isError: false,
                        data: 'Die Attribute wurden erfolgreich aktualisiert.'
                    }
                } else {
                    this.userGeneralForm.message = {
                        isError: false,
                        data: 'Die Attribute wurden nicht geändert.'
                    }
                }
            } catch (e) {
                this.userGeneralForm.message = {
                    isError: true,
                    data: e.message
                }
            }

            this.userGeneralForm.busy = false;
        },
    }
}
</script>
<template>
    <div>
        <form @submit.prevent="submitGeneralForm">
            <div
                v-if="userGeneralForm.message"
                :class="{'alert-warning': userGeneralForm.message.isError, 'alert-primary': !userGeneralForm.message.isError}"
                class="alert alert-sm">
                {{userGeneralForm.message.data}}
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.userGeneralForm.realmId.$error }">
                <label>Realm</label>
                <select
                    v-model="$v.userGeneralForm.realmId.$model"
                    class="form-control"
                    :disabled="realm.busy"
                >
                    <option value="">--- Bitte auswählen ---</option>
                    <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
                </select>

                <div v-if="!$v.userGeneralForm.realmId.required && !$v.userGeneralForm.realmId.$model" class="form-group-hint group-required">
                    Bitte geben Sie einen Realm an.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.userGeneralForm.name.$error }">
                <label>Name</label>
                <input v-model="$v.userGeneralForm.name.$model" type="text" name="name" class="form-control" placeholder="Benutzer-Name...">

                <div v-if="!$v.userGeneralForm.name.required" class="form-group-hint group-required">
                    Bitte geben Sie einen Benutzernamen an.
                </div>
                <div v-if="!$v.userGeneralForm.name.minLength" class="form-group-hint group-required">
                    Der Benutzername muss mindestens <strong>{{ $v.userGeneralForm.name.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.userGeneralForm.name.maxLength" class="form-group-hint group-required">
                    Der Benutzername darf maximal <strong>{{ $v.userGeneralForm.name.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <hr>

            <div class="form-group" :class="{ 'form-group-error': $v.userGeneralForm.email.$error }">
                <label>Email</label>
                <input v-model="$v.userGeneralForm.email.$model" type="email" name="email" class="form-control" placeholder="Email-Addresse...">

                <div v-if="!$v.userGeneralForm.email.required" class="form-group-hint group-required">
                    Es muss eine E-Mail Addresse anggeben werden.
                </div>
                <div v-if="!$v.userGeneralForm.email.minLength" class="form-group-hint group-required">
                    Die E-Mail Addresse muss mindestens <strong>{{ $v.userGeneralForm.email.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.userGeneralForm.email.maxLength" class="form-group-hint group-required">
                    Die E-Mail Addresse darf maximal <strong>{{ $v.userGeneralForm.email.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.userGeneralForm.email.email" class="form-group-hint group-required">
                    Die E-Mail Addresse ist nicht gültig.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button :disabled="$v.userGeneralForm.$invalid || userGeneralForm.busy" @click.prevent="submitGeneralForm" type="submit" class="btn btn-primary btn-xs">
                    <i class="fa fa-save"></i> Speichern
                </button>
            </div>
        </form>
    </div>
</template>
