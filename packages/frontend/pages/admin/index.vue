<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {Layout, LayoutNavigationID} from "../../modules/layout/contants";
import {PermissionID} from "@personalhealthtrain/ui-common";

    export default {
        meta: {
            [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
                PermissionID.ADMIN_UI_USE
            ]
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
