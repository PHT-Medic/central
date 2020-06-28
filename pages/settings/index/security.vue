<script>
    import { mapActions, mapGetters } from "vuex";
    import AlertMessage from "../../../components/alert/AlertMessage";
    import UserPublicKeyEdge from "../../../services/edge/user/userPublicKeyEdge";
    import userPasswordFormMixin from "../../../mixins/userPasswordFormMixin";

    export default {
        mixins: [
            userPasswordFormMixin
        ],
        components: {
            AlertMessage
        },
        meta: {
            requireLoggedIn: true
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ])
        },
        async asyncData() {
            let userPublicKey = null;

            try {
                let response = await UserPublicKeyEdge.getKey();
                userPublicKey = response.content;
            } catch (e) {

            }

            return {
                temp: {
                    publicKey: userPublicKey
                }
            }
        },
        created() {
            this.userData = this.user;

            if(this.temp.publicKey) {
                this.encryptionForm.publicKey = this.temp.publicKey;
                this.encryptionForm.uploaded = true;
            }
        },
        data () {
            return {
                encryptionForm: {
                    uploaded: false,
                    publicKey: null,
                    ready: true,

                    error: null
                },
                temp: null
            }
        },
        methods: {
            ...mapActions('auth',[
                'triggerSetUserProperty'
            ]),

            //--------------------------------------------------------------

            async dropPublicKey(event) {
                event.preventDefault();

                try {
                    await UserPublicKeyEdge.dropKey();

                    this.encryptionForm.publicKey = '';
                    this.encryptionForm.uploaded = false;
                } catch (e) {
                    this.encryptionForm.error = {
                        message: e.message
                    };
                }
            },
            async uploadPublicKey(event) {
                event.preventDefault();

                try {
                    await UserPublicKeyEdge.addKey(this.encryptionForm.publicKey);

                    this.encryptionForm.uploaded = true;
                } catch (e) {
                    this.encryptionForm.error = {
                        message: e.message
                    };
                }
            },
            async setFormPublicKey(event) {
                event.preventDefault();

                this.encryptionForm.ready = false;

                let file = this.$refs.myFile.files[0];

                let reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (evt) => {
                    this.encryptionForm.publicKey = evt.target.result;
                    this.encryptionForm.ready = true;
                };
                reader.onerror = (evt) => {

                };
            }
        }
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
                        <div v-if="encryptionForm.error" class="alert-warning alert-sm">
                            {{encryptionForm.error.message}}
                        </div>
                        <div v-if="encryptionForm.uploaded">
                            <div class="well well-sm m-b-20" v-html="encryptionForm.publicKey"></div>
                            <div class="form-group">
                                <button @click="dropPublicKey" :disabled="!encryptionForm.ready" type="button" class="btn btn-xs btn-danger">
                                    <i class="fa fa-times"></i> Löschen
                                </button>
                            </div>
                        </div>
                        <div v-if="!encryptionForm.uploaded">
                            <div v-if="!encryptionForm.publicKey" class="alert-sm alert-danger m-b-20">
                                Bitte laden Sie Ihren <b>Public Key</b> hoch. Dieser wird zu Erstellung des Zuges benötigt.
                            </div>

                            <form>
                                <div class="form-group">
                                    <div class="custom-file">
                                        <input ref="myFile" @change="setFormPublicKey" type="file" class="custom-file-input" id="userPublicKey">
                                        <label class="custom-file-label" for="userPublicKey">Public Key auswählen...</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <textarea class="form-control" v-model="encryptionForm.publicKey" rows="8" />
                                </div>
                                <div class="form-group">
                                    <button @click="uploadPublicKey" :disabled="!encryptionForm.ready" type="button" class="btn btn-xs btn-primary">
                                        <i class="fa fa-plus"></i> Hochladen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
