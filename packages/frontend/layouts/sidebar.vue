<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    export default {
        computed: {
            loggedIn(vm) {
                return vm.$store.getters['auth/loggedIn'];
            },
            components(vm) {
                return vm.$store.state.layout.sidebarComponents;
            },
            docsUrl() {
                return new URL('docs/', this.$config.apiUrl).href;
            },
            statsUrl() {
                return new URL('stats/', this.$config.apiUrl).href;
            },
            generalDocsUrl() {
                return 'https://pht-medic.github.io/documentation/';
            }
        }
    }
</script>
<template>
    <div class="page-sidebar">
        <ul class="sidebar-menu">
            <li
                v-for="(component,key) in components"
                :key="key">
                <template v-if="component.type === 'separator'" >
                    <div class="nav-separator">
                        {{ component.name }}
                    </div>
                </template>
                <template v-if="component.type === 'link'">
                    <template v-if="!component.components">
                        <nuxt-link :to="component.url" class="sidebar-menu-link" :class="{'root-link': component.rootLink}">
                            <i v-if="component.icon" :class="component.icon" /> {{ component.name }}
                        </nuxt-link>
                    </template>
                    <template v-if="component.components">
                        <div class="sidebar-submenu-title">
                            {{ component.name }}
                        </div>
                        <ul class="list-unstyled sidebar-submenu-components">
                            <li v-for="(subValue,subKey) in component.components" :key="subKey">
                                <nuxt-link :to="subValue.link" class="sidebar-menu-link">
                                    <i v-if="component.icon" :class="component.icon" /> {{ subValue.name }}
                                </nuxt-link>
                            </li>
                        </ul>
                    </template>
                </template>
            </li>
        </ul>

        <div class="mt-auto">
            <ul class="sidebar-menu">
                <li>
                    <div class="nav-separator">
                        API
                    </div>
                </li>
                <li>
                    <a class="sidebar-menu-link" :href="docsUrl" target="_blank">
                        <i class="fa fa-file"></i> Documentation
                    </a>
                </li>
                <li>
                    <a class="sidebar-menu-link" :href="statsUrl" target="_blank">
                        <i class="fa fa-chart-bar"></i> Stats
                    </a>
                </li>
                <li>
                    <div class="nav-separator">
                        General
                    </div>
                </li>
                <li>
                    <a class="sidebar-menu-link" :href="generalDocsUrl" target="_blank">
                        <i class="fa fa-file-pdf"></i> Documentation / Guide
                    </a>
                </li>

            </ul>
        </div>
    </div>
</template>

