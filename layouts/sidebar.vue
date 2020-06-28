<script>
    import { mapGetters } from 'vuex'
    import { LayoutService } from '../services/layout';

    export default {
        components: {},
        computed: {
            ...mapGetters('auth', [
                'loggedIn'
            ]),
            ...mapGetters('layout', [
                'sidebarComponents'
            ]),
            components: (vm) => {
                return LayoutService.reduceComponents({
                    components: vm.sidebarComponents,
                    loggedIn: vm.loggedIn,
                    can: vm.$can
                });
            }
        }
    }
</script>
<template>
    <div class="page-sidebar">
        <ul class="sidebar-menu">
            <li v-for="(component,key) in components" :key="key">
                <div v-if="component.type === 'separator'" class="nav-separator">
                    {{ component.name }}
                </div>
                <div v-if="component.type === 'link'">
          <span v-if="!component.subcomponents">
            <nuxt-link :to="component.value" class="sidebar-menu-link">
              <i v-if="component.icon" :class="component.icon" /> {{ component.name }}
            </nuxt-link>
          </span>
                    <span v-if="component.subcomponents">
            <span class="sidebar-submenu-title">
              {{ component.name }}
            </span>
            <ul class="list-unstyled sidebar-submenu-components">
              <li v-for="(subValue,subKey) in component.subcomponents" :key="subKey">
                <nuxt-link :to="subValue.link" class="sidebar-menu-link">
                  <i v-if="component.icon" :class="component.icon" /> {{ subValue.name }}
                </nuxt-link>
              </li>
            </ul>
          </span>
                </div>
            </li>
        </ul>
    </div>
</template>

