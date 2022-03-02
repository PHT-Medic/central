<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { TrainList } from '../../../../components/domains/train/TrainList';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

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
            PermissionID.TRAIN_EXECUTION_STOP,
        ],
    },
    components: { TrainList },
    props: {
        proposal: {
            type: Object,
            default() {
                return {};
            },
        },
        visitorStation: {
            type: Object,
            default: undefined,
        },
    },
    computed: {
        station_id() {
            return this.visitorStation ? this.visitorStation.id : undefined;
        },
        query() {
            return {
                filter: {
                    proposal_id: this.proposal.id,
                },
            };
        },
    },
    methods: {
    },
};
</script>
<template>
    <div>
        <div class="m-t-10">
            <template v-if="visitorStation">
                <div class="alert alert-sm alert-warning">
                    You are not permitted to view the train list.
                </div>
            </template>
            <template v-else>
                <train-list
                    ref="trainTable"
                    :query="query"
                />
            </template>
        </div>
    </div>
</template>
