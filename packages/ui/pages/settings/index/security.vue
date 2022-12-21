<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    meta: {
        requireLoggedIn: true,
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
    },
    methods: {
        handleUpdated() {
            this.$bvToast.toast('The password was successfully updated.', {
                variant: 'success',
                toaster: 'b-toaster-top-center',
            });
        },
    },
};
</script>
<template>
    <div class="mb-2">
        <h6 class="title">
            Password
        </h6>

        <user-password-form
            :id="user.id"
            @updated="handleUpdated"
        />
    </div>
</template>
