import {mapActions, mapGetters} from "vuex";
import {maxLength, minLength, required, sameAs} from "vuelidate/lib/validators";
import {editUser} from "@/domains/user/api.ts";

const userPasswordFormMixin = {
    computed: {
        ...mapGetters('auth', [
            'loggedIn',
            'user'
        ])
    },
    data() {
        return {
            userPasswordForm: {
                password: '',
                passwordRepeat: '',

                message: null,
                busy: false
            },
            userData: null
        }
    },
    validations: {
        userPasswordForm: {
            password: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100)
            },
            passwordRepeat: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100),
                sameAsPassword: sameAs('password')
            },
        }
    },
    methods: {
        ...mapActions('auth',[
            'triggerSetUserProperty'
        ]),

        //---------------------------------------------------------------

        async submitPasswordForm(event) {
            event.preventDefault();

            if(this.userPasswordForm.busy) {
                return;
            }

            this.userPasswordForm.busy = true;

            try {
                let {password, passwordRepeat} = this.userPasswordForm;

                await editUser(this.userData.id, {password, passwordRepeat});

                this.userPasswordForm.message = {
                    isError: false,
                    data: 'Das Passwort wurde erfolgreich aktualisiert.'
                }

            } catch (e) {
                this.userPasswordForm.message = {
                    isError: true,
                    data: e.message
                }
            }

            this.userPasswordForm.busy = false;
        }
    }
};

export default userPasswordFormMixin;
