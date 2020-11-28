<script>
    import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

    import AlertMessage from "../../../components/alert/AlertMessage";
    import NotImplemented from "../../../components/NotImplemented";
    import {LayoutNavigationAdminId} from "../../../config/layout";
    import {addUser} from "@/domains/user/api.ts";
    import {getRealms} from "@/domains/realm/api.ts";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add','user');
            }
        },
        components: {
            AlertMessage,
            NotImplemented
        },
        data() {
            return {
                formData: {
                    name: '',
                    realmId: '',
                    email: '',
                    password: ''
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
                    minLength: minLength(5),
                    maxLength: maxLength(30)
                },
                email: {
                    minLength: minLength(5),
                    maxLength: maxLength(255),
                    email
                },
                password: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(100)
                },
                realmId: {
                    required
                }
            }
        },
        created() {
            this.loadRealms().then(r => r);
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

                this.error = null;
                this.busy = true;

                try {
                    let response = await addUser(this.formData);
                    await this.$nuxt.$router.push('/admin/users/' + response.id);
                } catch (e) {
                    this.message = {
                        data: e.message,
                        isError: true
                    }
                }

                this.busy = false;
            }
        }
    }
</script>
<template>
    <div class="container">
        <h4 class="title m-b-10">
            Benutzer <span class="sub-title">Hinzufügen</span>
        </h4>

        <div class="row">
            <div class="col">
                <div class="panel-card m-b-20">
                    <div class="panel-card-header">
                        <h5 class="title">
                            Allgemein <i class="fa fa-info"></i>
                        </h5>
                    </div>
                    <div class="panel-card-body">
                        <alert-message :message="message" />

                        <div class="form-group">
                            <div class="form-group" :class="{ 'form-group-error': $v.formData.realmId.$error }">
                                <label>Realm</label>
                                <select
                                    v-model="$v.formData.realmId.$model"
                                    class="form-control"
                                    :disabled="realm.busy"
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
                                <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Benutzer-Name...">

                                <div v-if="!$v.formData.name.required" class="form-group-hint group-required">
                                    Bitte geben Sie einen Benutzernamen an.
                                </div>
                                <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                                    Der Benutzername muss mindestens <strong>{{ $v.formData.name.$params.minLength.min }}</strong> Zeichen lang sein.
                                </div>
                                <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                                    Der Benutzername darf maximal <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> Zeichen lang sein.
                                </div>
                            </div>

                            <hr>

                            <div class="form-group" :class="{ 'form-group-error': $v.formData.password.$error }">
                                <label>Password</label>
                                <input v-model="$v.formData.password.$model" name="password" type="password" class="form-control" placeholder="Passwort...">

                                <div v-if="!$v.formData.password.required" class="form-group-hint group-required">
                                    Es muss ein Passwort angegeben werden.
                                </div>
                                <div v-if="!$v.formData.password.minLength" class="form-group-hint group-required">
                                    Das Passwort muss mindestens <strong>{{ $v.formData.password.$params.minLength.min }}</strong> Zeichen lang sein.
                                </div>
                                <div v-if="!$v.formData.password.maxLength" class="form-group-hint group-required">
                                    Das Passwort darf maximal <strong>{{ $v.formData.password.$params.maxLength.max }}</strong> Zeichen lang sein.
                                </div>
                            </div>

                            <hr>

                            <div class="form-group" :class="{ 'form-group-error': $v.formData.email.$error }">
                                <label>Email</label>
                                <input v-model="$v.formData.email.$model" type="email" name="email" class="form-control" placeholder="Email-Addresse...">

                                <div v-if="!$v.formData.email.minLength" class="form-group-hint group-required">
                                    Die E-Mail Addresse muss mindestens <strong>{{ $v.formData.email.$params.minLength.min }}</strong> Zeichen lang sein.
                                </div>
                                <div v-if="!$v.formData.email.maxLength" class="form-group-hint group-required">
                                    Die E-Mail Addresse darf maximal <strong>{{ $v.formData.email.$params.maxLength.max }}</strong> Zeichen lang sein.
                                </div>
                                <div v-if="!$v.formData.email.email" class="form-group-hint group-required">
                                    Die E-Mail Addresse ist nicht gültig.
                                </div>
                            </div>

                            <hr>

                            <div class="form-group">
                                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click="handleSubmit">
                                    Erstellen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
    .list-group-item {
        padding: .45rem .65rem;
    }
</style>
