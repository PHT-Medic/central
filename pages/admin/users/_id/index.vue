<script>
    import {LayoutNavigationAdminId} from "../../../../config/layout";
    import UserDetailsForm from "@/components/user/UserDetailsForm";
    import UserPasswordForm from "@/components/user/UserPasswordForm";

    export default {
        props: {
            userProperty: {
                type: Object
            }
        },
        meta: {
            navigationId: LayoutNavigationAdminId
        },
        components: {
            UserPasswordForm,
            UserDetailsForm
        },
        methods: {
            handleUserUpdated(e) {
                this.$emit('userUpdated', e);
            }
        }
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-7">
                <h6>General</h6>
                <user-details-form :user-property="userProperty" @updated="handleUserUpdated" />
            </div>
            <div class="col-5">
                <h6>Password</h6>
                <user-password-form :user-property="userProperty" @updated="handleUserUpdated" />
            </div>
        </div>
    </div>
</template>
