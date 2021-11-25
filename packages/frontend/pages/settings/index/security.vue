<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import UserPasswordForm from '../../../components/domains/user/UserPasswordForm';

export default {
    components: {
        UserPasswordForm,
    },
    meta: {
        requireLoggedIn: true,
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
    },
};
</script>
<template>
    <div class="mb-2">
        <h6 class="title">
            Password
        </h6>

        <user-password-form :user-property="user" />
    </div>
</template>
