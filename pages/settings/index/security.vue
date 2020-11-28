<script>
import {mapActions, mapGetters} from "vuex";
import AlertMessage from "../../../components/alert/AlertMessage";
import userPasswordFormMixin from "../../../mixins/userPasswordFormMixin";
import {addUserKey, dropUserKey, getUserPublicKey} from "@/domains/user/publicKey/api.ts";
import UserPublicKeyForm from "@/components/user/UserPublicKeyForm";

export default {
        mixins: [
            userPasswordFormMixin
        ],
        components: {
            UserPublicKeyForm,
            AlertMessage
        },
        meta: {
            requireLoggedIn: true
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ]),
        },
        created() {
            this.userData = this.user;
        },
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-7">
                <div class="panel-card m-b-20">
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
            <div class="col-5">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Public Key
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <user-public-key-form :user-property="user" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
