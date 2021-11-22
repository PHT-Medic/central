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
    import {LayoutKey, LayoutNavigationID} from "../../../../config/layout/contants";
    import {PermissionID} from "@personalhealthtrain/ui-common";

    export default {
        meta: {
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
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
