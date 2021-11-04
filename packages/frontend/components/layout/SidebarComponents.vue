<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script>
export default {
    name: 'SidebarComponents',
    props: {
        items: {
            type: Array,
            default: function () {
                return [];
            }
        }
    }
}
</script>
<template>
    <ul>
        <li
            v-for="(component,key) in items"
            :key="key"
        >
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
                    <div
                        class="sidebar-submenu-title"
                    >
                        <i v-if="component.icon" :class="component.icon" /> {{ component.name }}
                    </div>
                    <sidebar-components
                        class="list-unstyled sidebar-submenu-components"
                        :items="component.components"
                    />
                </template>
            </template>
        </li>
    </ul>
</template>
