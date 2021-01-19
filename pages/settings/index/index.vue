<script>
    import AlertMessage from "../../../components/alert/AlertMessage";
    import { mapGetters } from "vuex";
    import UserDetailsForm from "@/components/user/UserDetailsForm";

    export default {
        meta: {
            requireLoggedIn: true
        },
        computed: {
            user() {
                return this.$store.getters['auth/user'];
            }
        },
        components: {
            UserDetailsForm,
            AlertMessage
        },

    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-12">
                <h6 class="title">
                    General
                </h6>

                <hr />
                <user-details-form :user-property="user"/>
            </div>
            <div class="col-6">

            </div>
        </div>
    </div>
</template>
