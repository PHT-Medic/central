<script>
    import AlertMessage from "../../../components/alert/AlertMessage";
    import userGeneralFormMixin from "../../../mixins/userGeneralFormMixin";
    import { mapGetters } from "vuex";

    export default {
        meta: {
            requiresAuth: true
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ])
        },
        components: {
            AlertMessage
        },
        mixins: [
            userGeneralFormMixin
        ],
        created() {
            this.userData = this.user;

            let user = Object.assign({},this.userData);

            this.userGeneralForm.name = user.name;
            this.userGeneralForm.email = user.email;
        },
        data () {
            return {

            }
        }
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-12">
                <div class="panel-card m-b-20">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Allgemein
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <form>
                            <alert-message :message="userGeneralForm.message" />

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
                                <button :disabled="$v.userGeneralForm.$invalid || userGeneralForm.busy" @click="submitGeneralForm" type="submit" class="btn btn-primary btn-xs"><i class="fa fa-save"></i> Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-6">

            </div>
        </div>
    </div>
</template>
