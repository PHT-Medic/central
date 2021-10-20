<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {addAPIUser, getAPIRealms} from "@personalhealthtrain/ui-common";
    import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

    import AlertMessage from "../../../components/alert/AlertMessage";
    import NotImplemented from "../../../components/NotImplemented";
    import {LayoutNavigationAdminId} from "../../../config/layout";

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
                    realm_id: '',
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
                realm_id: {
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
                    const response = await getAPIRealms();
                    this.realm.items = response.data;
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
                    let response = await addAPIUser(this.formData);
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
        <h1 class="title no-border mb-3">
            User <span class="sub-title">Add</span>
        </h1>

        <alert-message :message="message" />

        <div class="form-group" :class="{ 'form-group-error': $v.formData.realm_id.$error }">
            <label>Realm</label>
            <select
                v-model="$v.formData.realm_id.$model"
                class="form-control"
                :disabled="realm.busy"
            >
                <option value="">--- Please select ---</option>
                <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
            </select>

            <div v-if="!$v.formData.realm_id.required && !$v.formData.realm_id.$model" class="form-group-hint group-required">
                Select a realm
            </div>
        </div>

        <div class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
            <label>Name</label>
            <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Benutzer-Name...">

            <div v-if="!$v.formData.name.required" class="form-group-hint group-required">
                Enter an username
            </div>
            <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                The length of the name mus be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters
            </div>
            <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                The length of the name mus be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters
            </div>
        </div>

        <hr>

        <div class="form-group" :class="{ 'form-group-error': $v.formData.password.$error }">
            <label>Password</label>
            <input v-model="$v.formData.password.$model" name="password" type="password" class="form-control" placeholder="Passwort...">

            <div v-if="!$v.formData.password.required" class="form-group-hint group-required">
                Enter a password
            </div>
            <div v-if="!$v.formData.password.minLength" class="form-group-hint group-required">
                The length of the password mus be greater than <strong>{{ $v.formData.password.$params.minLength.min }}</strong> characters
            </div>
            <div v-if="!$v.formData.password.maxLength" class="form-group-hint group-required">
                The length of the password mus be less than <strong>{{ $v.formData.password.$params.maxLength.max }}</strong> characters
            </div>
        </div>

        <hr>

        <div class="form-group" :class="{ 'form-group-error': $v.formData.email.$error }">
            <label>Email</label>
            <input v-model="$v.formData.email.$model" type="email" name="email" class="form-control" placeholder="Email-Addresse...">

            <div v-if="!$v.formData.email.minLength" class="form-group-hint group-required">
                The length of the password mus be greater than <strong>{{ $v.formData.email.$params.minLength.min }}</strong> characters
            </div>
            <div v-if="!$v.formData.email.maxLength" class="form-group-hint group-required">
                The length of the password mus be less than <strong>{{ $v.formData.email.$params.maxLength.max }}</strong> characters
            </div>
            <div v-if="!$v.formData.email.email" class="form-group-hint group-required">
                The e-mail is not valid.
            </div>
        </div>

        <hr>

        <div class="form-group">
            <button type="submit" class="btn btn-primary btn-sm" :disabled="$v.$invalid || busy" @click="handleSubmit">
                Create
            </button>
        </div>
    </div>
</template>
<style>
    .list-group-item {
        padding: .45rem .65rem;
    }
</style>
