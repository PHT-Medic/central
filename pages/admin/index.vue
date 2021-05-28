<script>
    import {LayoutNavigationAdminId} from "../../config/layout";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility(can) {
                return can('use','adminUi');
            }
        },
    }
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            Dashboard <span class="sub-title">Overview</span>
        </h1>
    </div>
</template>
