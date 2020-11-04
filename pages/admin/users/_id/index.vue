<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import {adminNavigationId} from "../../../../config/layout";
    import userGeneralFormMixin from "../../../../mixins/userGeneralFormMixin";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import userPasswordFormMixin from "~/mixins/userPasswordFormMixin";

    export default {
        props: {
            providedUser: {
                type: Object
            }
        },
        meta: {
            navigationId: adminNavigationId
        },
        mixins: [
            userGeneralFormMixin,
            userPasswordFormMixin
        ],
        components: {
            NotImplemented,
            AlertMessage
        },
        created() {
            this.userData = this.providedUser;

            let user = Object.assign({},this.userData);

            this.userGeneralForm.name = user.name;
            this.userGeneralForm.email = user.email;
        },
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-7">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Allgmein
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <form>
                            <div
                                v-if="userGeneralForm.message"
                                :class="{'alert-warning': userGeneralForm.message.isError, 'alert-primary': !userGeneralForm.message.isError}"
                                class="alert alert-sm">
                                {{userGeneralForm.message.data}}
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
                                <button :disabled="$v.userGeneralForm.$invalid || userGeneralForm.busy" @click="submitGeneralForm" type="submit" class="btn btn-primary btn-xs"><i class="fa fa-save"></i> Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-5">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Passwort
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <alert-message :message="userPasswordForm.message" />

                        <div class="form-group" :class="{ 'form-group-error': $v.userPasswordForm.password.$error }">
                            <label>Passwort</label>
                            <input v-model="$v.userPasswordForm.password.$model" type="password" name="name" class="form-control" placeholder="Passwort...">

                            <div v-if="!$v.userPasswordForm.password.required" class="form-group-hint group-required">
                                Bitte geben Sie einen Benutzernamen an.
                            </div>
                            <div v-if="!$v.userPasswordForm.password.minLength" class="form-group-hint group-required">
                                Der Benutzername muss mindestens <strong>{{ $v.userPasswordForm.password.$params.minLength.min }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.userPasswordForm.password.maxLength" class="form-group-hint group-required">
                                Der Benutzername darf maximal <strong>{{ $v.userPasswordForm.password.$params.maxLength.max }}</strong> Zeichen lang sein.
                            </div>
                        </div>

                        <div class="form-group" :class="{ 'form-group-error': $v.userPasswordForm.passwordRepeat.$error }">
                            <label>Passwort wiederholen</label>
                            <input v-model="$v.userPasswordForm.passwordRepeat.$model" type="password" name="name" class="form-control" placeholder="Passwort wiederholen...">

                            <div v-if="!$v.userPasswordForm.passwordRepeat.required" class="form-group-hint group-required">
                                Bitte geben Sie einen Benutzernamen an.
                            </div>
                            <div v-if="!$v.userPasswordForm.passwordRepeat.minLength" class="form-group-hint group-required">
                                Der Benutzername muss mindestens <strong>{{ $v.userPasswordForm.passwordRepeat.$params.minLength.min }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.userPasswordForm.passwordRepeat.maxLength" class="form-group-hint group-required">
                                Der Benutzername darf maximal <strong>{{ $v.userPasswordForm.passwordRepeat.$params.maxLength.max }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.userPasswordForm.passwordRepeat.sameAsPassword" class="form-group-hint group-required">
                                Die Passwörter sind nicht identisch...
                            </div>
                        </div>

                        <hr>

                        <div class="form-group">
                            <button :disabled="$v.userPasswordForm.$invalid || userPasswordForm.busy" @click="submitPasswordForm" type="submit" class="btn btn-primary btn-xs"><i class="fa fa-save"></i> Ändern</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
