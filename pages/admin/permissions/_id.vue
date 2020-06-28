<script>
    import {adminNavigationId} from "../../../config/layout";

    export default {
        meta: {
            navigationId: adminNavigationId,
            requireLoggedIn: true,
            requireAbility: (can) => {
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
