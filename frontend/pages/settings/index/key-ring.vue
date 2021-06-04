<script>
import UserPublicKeyForm from "@/components/user/UserPublicKeyForm";
import UserKeyRingForm from "@/components/user/UserKeyRingForm";
export default {
    components: {UserKeyRingForm, UserPublicKeyForm},
    data() {
        return {

        }
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        }
    }
}
</script>
<template>
    <user-key-ring-form :user-property="user" />
</template>
