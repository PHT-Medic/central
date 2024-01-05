<!--
  Copyright (c) 2021-2023.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCCountdown } from '@vuecs/countdown';
import { VCNavItems } from '@vuecs/navigation';
import { storeToRefs } from 'pinia';
import { defineNuxtComponent } from '#app';
import { computed, useAPI } from '#imports';
import { useAuthStore } from '../../store/auth';

export default defineNuxtComponent({
    components: { VCCountdown, VCNavItems },
    setup() {
        const store = useAuthStore();
        const { loggedIn, accessTokenExpireDate: tokenExpireDate, realmManagement } = storeToRefs(store);

        const tokenExpiresIn = computed(() => {
            if (!tokenExpireDate.value) {
                return 0;
            }

            return tokenExpireDate.value.getTime() - Date.now();
        });

        const docsURL = computed(() => {
            const api = useAPI();

            return new URL('docs/', api.getBaseURL()).href;
        });

        const metricsURL = computed(() => {
            const api = useAPI();

            return new URL('metrics', api.getBaseURL()).href;
        });

        return {
            loggedIn,
            tokenExpiresIn,
            docsURL,
            metricsURL,
            realmManagement,
        };
    },
});
</script>
<template>
    <div class="page-sidebar">
        <VCNavItems
            class="sidebar-menu navbar-nav"
            :tier="1"
        />

        <div class="mt-auto">
            <div
                v-if="loggedIn"
                class="font-weight-light d-flex flex-column ms-3 me-3 mb-1 mt-auto"
            >
                <small class="countdown-text">
                    <VCCountdown
                        :time="tokenExpiresIn"
                    >
                        <template #default="props">
                            <i class="fa fa-clock pe-1" /> The session expires in
                            <span class="text-success">
                                {{ props.minutes }} minute(s), {{ props.seconds }} second(s)
                            </span>
                        </template>
                    </VCCountdown>
                </small>
            </div>

            <ul class="sidebar-menu nav-items navbar-nav">
                <li class="nav-item">
                    <div class="nav-separator">
                        API
                    </div>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link"
                        :href="docsURL"
                        target="_blank"
                    >
                        <i class="fa fa-file" /> <span class="nav-link-text">Documentation</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link"
                        :href="metricsURL"
                        target="_blank"
                    >
                        <i class="fa fa-chart-bar" /> <span class="nav-link-text">Metrics</span>
                    </a>
                </li>
                <li class="nav-item">
                    <div class="nav-separator">
                        General
                    </div>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link"
                        href="https://pht-medic.github.io/documentation/"
                        target="_blank"
                    >
                        <i class="fa fa-file-pdf" /> <span class="nav-link-text">Documentation / Guide</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
<style scoped>
.countdown-text {
    color: #aeb2b7;
}
</style>
