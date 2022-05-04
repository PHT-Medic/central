<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Countdown from '../components/Countdown';

export default {
    components: { Countdown },
    computed: {
        loggedIn(vm) {
            return vm.$store.getters['auth/loggedIn'];
        },
        tokenExpireDate() {
            return this.$store.getters['auth/accessTokenExpireDate'];
        },
        tokenExpiresIn() {
            if (!this.tokenExpireDate) return 0;

            return this.tokenExpireDate.getTime() - Date.now();
        },

        docsUrl() {
            return new URL('docs/', this.$config.apiUrl).href;
        },
        metricsUrl() {
            return new URL('metrics', this.$config.apiUrl).href;
        },
        generalDocsUrl() {
            return 'https://pht-medic.github.io/documentation/';
        },
    },
};
</script>
<template>
    <div class="page-sidebar">
        <navigation-components
            class="sidebar-menu navbar-nav"
            :tier="1"
        />

        <div class="mt-auto">
            <div
                v-if="loggedIn"
                class="font-weight-light d-flex flex-column ml-3 mr-3 mb-1 mt-auto"
            >
                <small
                    class="text-muted"
                >
                    <countdown
                        :time="tokenExpiresIn"
                    >
                        <template slot-scope="props">
                            <i class="fa fa-clock pr-1" /> The session expires in
                            <span class="text-success">
                                {{ props.minutes }} minute(s), {{ props.seconds }} second(s)
                            </span>.
                        </template>
                    </countdown>
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
                        :href="docsUrl"
                        target="_blank"
                    >
                        <i class="fa fa-file" /> <span class="nav-link-text">Documentation</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link"
                        :href="metricsUrl"
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
                        :href="generalDocsUrl"
                        target="_blank"
                    >
                        <i class="fa fa-file-pdf" /> <span class="nav-link-text">Documentation / Guide</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
