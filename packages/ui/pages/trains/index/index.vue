<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Train } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed } from 'vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import TrainList from '../../../components/domains/train/TrainList';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { useAuthStore } from '../../../store/auth';

export default defineNuxtComponent({
    components: { TrainList },
    setup() {
        definePageMeta({
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
        });

        const store = useAuthStore();
        const { realmId } = storeToRefs(store);

        const query = computed<BuildInput<Train>>(() => ({
            filter: {
                realm_id: realmId.value,
            },
        }));

        return {
            query,
        };
    },
});
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is an overview of all created trains, either by you or a person of your station.
        </div>

        <div class="m-t-10">
            <train-list :query="query">
                <template #header-title>
                    <h6><i class="fa-solid fa-list pr-1" /> Overview</h6>
                </template>
            </train-list>
        </div>
    </div>
</template>
