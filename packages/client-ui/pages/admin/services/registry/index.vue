<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { Registry } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.REGISTRY_MANAGE,
            ],
        });

        const toast = useToast();

        const tabs = [
            {
                name: 'overview',
                urlSuffix: '',
                icon: 'fa fa-bars',
            },
            {
                name: 'add',
                urlSuffix: '/add',
                icon: 'fa fa-plus',
            },
        ];

        const handleDeleted = (item: Registry) => {
            toast.show({ variant: 'success', body: `The registry ${item.name} was successfully deleted.` });
        };

        return {
            handleDeleted,
            tabs,
        };
    },
});
</script>
<template>
    <div>
        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :direction="'vertical'"
                    :items="tabs"
                    :path="'/admin/services/registry'"
                />
            </div>
            <div class="content-container">
                <NuxtPage @deleted="handleDeleted" />
            </div>
        </div>
    </div>
</template>
