<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import UserDetailsForm from '../../../../components/domains/auth/user/UserDetailsForm';
import UserPasswordForm from '../../../../components/domains/auth/user/UserPasswordForm';

export default {
    components: {
        UserPasswordForm,
        UserDetailsForm,
    },
    props: {
        userProperty: {
            type: Object,
            default: undefined,
        },
    },
    methods: {
        handleUserUpdated(e) {
            this.$emit('userUpdated', e);
        },
    },
};
</script>
<template>
    <div>
        <div class="row">
            <div class="col-7">
                <h6>General</h6>
                <user-details-form
                    :user-property="userProperty"
                    @updated="handleUserUpdated"
                />
            </div>
            <div class="col-5">
                <h6>Password</h6>
                <user-password-form
                    :user-property="userProperty"
                    @updated="handleUserUpdated"
                />
            </div>
        </div>
    </div>
</template>
