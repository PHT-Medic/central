<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import TrainTable from "../../../../components/domains/train/TrainTable";
    import TrainBasicForm from "../../../../components/domains/train/TrainBasicForm";
    import StationTrainTable from "../../../../components/domains/station/StationTrainTable";
    import {Layout, LayoutNavigationID} from "../../../../modules/layout/contants";
    import {PermissionID} from "@personalhealthtrain/ui-common";

    export default {
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
        },
        components: {StationTrainTable, TrainBasicForm, TrainTable},
        props: {
            proposal: {
                type: Object,
                default () {
                    return {};
                }
            },
            visitorStation: {
                type: Object,
                default: undefined
            }
        },
        methods: {
        },
        computed: {
            station_id() {
                return this.visitorStation ? this.visitorStation.id : undefined;
            }
        }
    }
</script>
<template>
    <div>
        <div class="m-t-10">
            <template v-if="visitorStation">
                mmhhh station train table missing :) !!!
            </template>
            <template v-else>
                <train-table
                    ref="trainTable"
                    :proposal-id="proposal.id"
                    :train-add-to="'/proposals/'+proposal.id+'/trains/add'"
                />
            </template>
        </div>
    </div>
</template>
