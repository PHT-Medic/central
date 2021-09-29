<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {LayoutNavigationAdminId} from "~/config/layout";

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
