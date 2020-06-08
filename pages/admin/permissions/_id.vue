<script>
    import {adminSidebarId} from "../../../config/layout";

    export default {
        meta: {
            sidebarId: adminSidebarId,
            requiresAuth: true,
            requiresAbility: (can) => {
                return can('edit','permission')
            }
        }
    }
</script>
<template>
    <div>
        <h4 class="title">
            Berechtigungen Details
        </h4>

        <nuxt-child />
    </div>
</template>
