<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {LayoutNavigationDefaultId} from "../../../config/layout.ts";
import TrainTable from "../../../components/domains/train/TrainTable";
import {Layout, LayoutNavigationID} from "../../../modules/layout/contants";
import {PermissionID} from "@personalhealthtrain/ui-common";

export default {
    components: {TrainTable},
    meta: {
        [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.DEFAULT,
        [Layout.REQUIRED_PERMISSIONS_KEY]: [
            PermissionID.TRAIN_ADD,
            PermissionID.TRAIN_EDIT,
            PermissionID.TRAIN_DROP,

            PermissionID.TRAIN_RESULT_READ,

            PermissionID.TRAIN_EXECUTION_START,
            PermissionID.TRAIN_EXECUTION_STOP
        ]
    }
}
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is an overview of all created trains, either by you or a person of your station.
        </div>

        <div class="m-t-10">
            <train-table />
        </div>
    </div>
</template>
