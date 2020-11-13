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
                <div v-if="component.type === 'separator'" class="nav-separator">
                    {{ component.name }}
                </div>
                <div v-if="component.type === 'link'">
                    <div v-if="!component.components">
                        <nuxt-link :to="component.url" class="sidebar-menu-link">
                            <i v-if="component.icon" :class="component.icon" /> {{ component.name }}
                        </nuxt-link>
                    </div>
                    <div v-if="component.components">
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
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

