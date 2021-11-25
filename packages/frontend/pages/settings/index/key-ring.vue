<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import UserKeyRingForm from '../../../components/domains/user/UserKeyRingForm';

export default {
    components: { UserKeyRingForm },
    data() {
        return {

        };
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
    },
};
</script>
<template>
    <user-key-ring-form :user-property="user" />
</template>
