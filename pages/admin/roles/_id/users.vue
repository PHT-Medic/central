<script>
    import RoleUserList from "@/components/role/RoleUserList";

    export default {
        props: {
            roleProperty: {
                type: Object
            }
        },
        components: {
            RoleUserList
        },
    }
</script>
<template>
    <div>
        <vue-scroll style="height:500px">
            <role-user-list :role-id="roleProperty.id" />
        </vue-scroll>
    </div>
</template>
