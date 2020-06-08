<script>
    import {maxLength, minLength, required, email} from "vuelidate/lib/validators";
    import UserEdge from "../../../services/edge/user/userEdge";

    import AlertMessage from "../../../components/alert/AlertMessage";
    import NotImplemented from "../../../components/NotImplemented";
    import {adminSidebarId} from "../../../config/layout";
    import PermissionEdge from "../../../services/edge/permission/permissionEdge";

    export default {
        meta: {
            sidebarId: adminSidebarId,
            requiresAuth: true,
            requiresAbility: (can) => {
                return can('add','user');
            }
        },
        components: {
            AlertMessage,
            NotImplemented
        },
        async asyncData(context) {
            let permissions = [];

            try {
                permissions = await PermissionEdge.getPermissions();
            } catch (e) {

            }

            return {
                permissions
            }
        },
        data() {
            return {
                formData: {
                    name: '',
                    email: '',
                    password: ''
                },

                busy: false,
                message: null,

                permissions: []
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
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(255),
                    email
                },
                password: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(100)
                },
            }
        },
        methods: {
            async handleSubmit (e) {
                e.preventDefault();

                if (this.busy || this.$v.$invalid) {
                    return;
                }

                this.error = null;
                this.busy = true;

                try {
                    let response = await UserEdge.addUser(this.formData);
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
    <div>
        <h4 class="title m-b-10">
            Benutzer <span class="sub-title">Hinzufügen</span>
        </h4>

        <div class="row">
            <div class="col-8">
                <div class="panel-card m-b-20">
                    <div class="panel-card-header">
                        <h5 class="title">
                            Allgemein <i class="fa fa-info"></i>
                        </h5>
                    </div>
                    <div class="panel-card-body">
                        <alert-message :message="message" />

                        <div class="form-group">
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

                                <div v-if="!$v.formData.email.required" class="form-group-hint group-required">
                                    Es muss eine E-Mail Addresse anggeben werden.
                                </div>
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

                <div class="panel-card">
                    <div class="panel-card-header">
                        <h5 class="title">
                            Gruppen <i class="fa fa-users"></i>
                        </h5>
                    </div>
                    <div class="panel-card-body">
                        <not-implemented />
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h5 class="title">
                            Berechtigungen <i class="fa fa-user-secret"></i>
                        </h5>
                    </div>
                    <div class="panel-card-body">
                        <b-list-group class="overflow-auto" style="height:500px;">
                            <b-list-group-item v-for="(item,key) in permissions" class="flex-column align-items-start" :key="key">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1 font-weight-bold">{{item.name}}</h6>
                                    <b-form-checkbox switch />
                                </div>
                            </b-list-group-item>
                        </b-list-group>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
