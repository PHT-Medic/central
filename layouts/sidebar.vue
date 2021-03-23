<script>
    export default {
        computed: {
            loggedIn(vm) {
                return vm.$store.getters['auth/loggedIn'];
            },
            components(vm) {
                return vm.$store.state.layout.sidebarComponents;
            },
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
                            <li v-for="(subValue,subKey) in component.subcomponents" :key="subKey">
                                <nuxt-link :to="subValue.link" class="sidebar-menu-link">
                                    <i v-if="component.icon" :class="component.icon" /> {{ subValue.name }}
                                </nuxt-link>
                            </li>
                        </ul>
                    </template>
                </template>
            </li>
        </ul>
    </div>
</template>

