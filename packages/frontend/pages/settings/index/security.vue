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
    <div class="mb-2">
        <h6 class="title">
            Passwort
        </h6>

        <user-password-form :user-property="user" />
    </div>
</template>
