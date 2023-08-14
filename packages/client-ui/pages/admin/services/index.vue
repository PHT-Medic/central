<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID, ServiceID } from '@personalhealthtrain/core';
import { definePageMeta, navigateTo } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.SERVICE_MANAGE,
            ],
        });

        const items = [
            {
                id: ServiceID.SYSTEM, name: 'System', icon: 'fa-solid fa-atom', version: 'v1.0.0-alpha.0',
            },
            {
                id: ServiceID.STATION_REGISTRY, name: 'Station Registry', icon: 'fa-solid fa-box-archive', version: 'v1.0.0-alpha.0',
            },
        ];

        const thirdPartyItems = [
            {
                id: ServiceID.REGISTRY, name: 'Image Registry', icon: 'fab fa-docker', version: 'v2.4.0',
            },
        ];

        const goTo = async (id: string) => {
            await navigateTo(`/admin/services/${id}`);
        };

        return {
            goTo,
            items,
            thirdPartyItems,
        };
    },
});
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            Services <span class="sub-title">Management</span>
        </h1>

        <h6>
            Internal
        </h6>
        <div class="m-t-10">
            <div class="row">
                <div
                    v-for="(item,key) in items"
                    :key="key"
                    class="col-md-4 col-12 mb-3"
                >
                    <div
                        class="event-card p-3 d-flex flex-column text-center"
                        @click.prevent="goTo(item.id)"
                    >
                        <div class="event-card-header">
                            <h3>{{ item.name }}</h3>
                        </div>
                        <div class="event-card-body">
                            <i :class="item.icon" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <hr>

        <h6>External</h6>
        <div class="m-t-10">
            <div class="row">
                <div
                    v-for="(item,key) in thirdPartyItems"
                    :key="key"
                    class="col-md-4 col-12 mb-3"
                >
                    <div
                        class="event-card p-3 d-flex flex-column text-center"
                        @click.prevent="goTo(item.id)"
                    >
                        <div class="event-card-header">
                            <h3>{{ item.name }}</h3>
                        </div>
                        <div class="event-card-body">
                            <i :class="item.icon" />
                        </div>
                        <div class="event-card-footer">
                            <div class="d-flex flex-row">
                                <div class="ms-auto">
                                    <span class="foot-print">{{ item.version }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.event-card {
    background-color: #ececec;
    border: 1px solid #dedede;
    box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
    border-radius: 4px;
    cursor: pointer;
}
.event-card-header,
.event-card-header a {
    text-decoration: none;
}
.event-card-header a:hover,
.event-card-header a:active {
    font-weight: 600;
    color: inherit;
}
.event-card-body i {
    font-size: 5rem;
}
.event-card .foot-print {
    color: #cc8181;
}

</style>
