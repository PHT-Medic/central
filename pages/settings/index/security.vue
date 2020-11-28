<script>
import userPasswordFormMixin from "../../../mixins/userPasswordFormMixin";
import UserPublicKeyForm from "@/components/user/UserPublicKeyForm";
import UserPasswordForm from "@/components/user/UserPasswordForm";

export default {
        mixins: [
            userPasswordFormMixin
        ],
        components: {
            UserPasswordForm,
            UserPublicKeyForm
        },
        meta: {
            requireLoggedIn: true
        },
        computed: {
            user() {
                return this.$store.getters['auth/user'];
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
                        <user-password-form :user-property="user" />
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
