<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {maxLength, minLength, required, sameAs} from "vuelidate/lib/validators";
import {editUser} from "@/domains/user/api.ts";
import AlertMessage from "@/components/alert/AlertMessage";

export default {
    components: {AlertMessage},
    props: {
        userProperty: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            form: {
                password: '',
                passwordRepeat: '',
                passwordShow: false,

                message: null,
                busy: false
            },
            userData: null
        }
    },
    validations: {
        form: {
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
        //---------------------------------------------------------------

        async submit() {
            if(this.form.busy) return

            this.form.busy = true;

            try {
                const user = await editUser(this.userProperty.id, {
                    password: this.form.password,
                    passwordRepeat: this.form.passwordRepeat
                });

                this.form.message = {
                    isError: false,
                    data: 'Das Passwort wurde erfolgreich aktualisiert.'
                }

                this.$emit('updated', user);
            } catch (e) {
                this.form.message = {
                    isError: true,
                    data: e.message
                }
            }

            this.form.busy = false;
        }
    }
}
</script>
<template>
    <form @submit.prevent="submit">
        <alert-message :message="form.message" />

        <div class="form-group" :class="{ 'form-group-error': $v.form.password.$error }">
            <label>Passwort</label>
            <input v-model="$v.form.password.$model" :type="form.passwordShow ? 'text' : 'password'"  name="name" class="form-control" placeholder="Passwort...">

            <div v-if="!$v.form.password.required" class="form-group-hint group-required">
                Bitte geben Sie ein Passwort an.
            </div>
            <div v-if="!$v.form.password.minLength" class="form-group-hint group-required">
                Das Passwort muss mindestens <strong>{{ $v.form.password.$params.minLength.min }}</strong> Zeichen lang sein.
            </div>
            <div v-if="!$v.form.password.maxLength" class="form-group-hint group-required">
                Das Passwort darf maximal <strong>{{ $v.form.password.$params.maxLength.max }}</strong> Zeichen lang sein.
            </div>
        </div>

        <div class="form-group" :class="{ 'form-group-error': $v.form.passwordRepeat.$error }">
            <label>Passwort wiederholen</label>
            <input v-model="$v.form.passwordRepeat.$model" :type="form.passwordShow ? 'text' : 'password'" name="name" class="form-control" placeholder="Passwort wiederholen...">

            <div v-if="!$v.form.passwordRepeat.required" class="form-group-hint group-required">
                Bitte geben Sie das Passwort erneut an.
            </div>
            <div v-if="!$v.form.passwordRepeat.minLength" class="form-group-hint group-required">
                Das Password muss mindestens <strong>{{ $v.form.passwordRepeat.$params.minLength.min }}</strong> Zeichen lang sein.
            </div>
            <div v-if="!$v.form.passwordRepeat.maxLength" class="form-group-hint group-required">
                Das Password darf maximal <strong>{{ $v.form.passwordRepeat.$params.maxLength.max }}</strong> Zeichen lang sein.
            </div>
            <div v-if="!$v.form.passwordRepeat.sameAsPassword" class="form-group-hint group-required">
                Die Passwörter sind nicht identisch...
            </div>
        </div>

        <div class="form-group pl-1 mb-1">
            <b-form-checkbox v-model="form.passwordShow" switch>
                Passwort {{ form.passwordShow ? 'ausblenden' : 'anzeigen' }}
            </b-form-checkbox>
        </div>

        <hr>

        <div class="form-group">
            <button :disabled="$v.form.$invalid || form.busy" @click.prevent="submit" type="submit" class="btn btn-primary btn-xs"><i class="fa fa-save"></i> Ändern</button>
        </div>
    </form>
</template>
