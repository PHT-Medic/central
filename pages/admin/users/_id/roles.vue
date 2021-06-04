<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import UserRoleList from "@/components/user/role/UserRoleList";

    export default {
        props: {
            userProperty: {
                type: Object
            }
        },
        components: {
            UserRoleList,
            NotImplemented
        },
        data() {
            return {
                role: {
                    items: [],
                    busy: false
                },
                q: '',
                showOnlyOwnedRoles: true
            }
        },
        methods: {
            handleCreated(e) {

            },
            handleDeleted(e) {

            }
        }
    }
</script>
<template>
    <div>
        <vue-scroll style="height:500px">
            <user-role-list :user-id="userProperty.id" />
        </vue-scroll>
    </div>
</template>
