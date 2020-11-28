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
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Allgmein
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <user-details-form :user-property="userProperty" @updated="handleUserUpdated" />
                    </div>
                </div>
            </div>
            <div class="col-5">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Passwort
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <user-password-form :user-property="userProperty" @updated="handleUserUpdated" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
