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
      const components = vm.sidebarComponents;

      return LayoutService.reduceComponents({
        components,
        loggedIn: vm.loggedIn
      });
      /*
      if (vm.loggedIn) {
        components = [
          { name: 'Übersicht', type: 'link', value: '/dashboard', subcomponents: false, separator: 'Allgemein' },
          { name: 'Erstellen', type: 'link', value: '/proposals/add', subcomponents: false, separator: false },
          {
            name: 'Antrag',
            type: 'link',
            value: false,
            subcomponents: [
              { name: 'Erstellen', type: 'link', value: '/train/proposal-add' },
              { name: 'Liste', type: 'link', value: '/train/proposals' }
            ],
            separator: 'Zug'
          },
          {
            name: 'Sendung',
            type: 'link',
            value: false,
            subcomponents: [
              { name: 'Erstellen', type: 'link', value: '/train/consignment-add' },
              { name: 'Liste (Status)', type: 'link', value: '/train/consignments' }
            ],
            separator: false
          },
          { name: 'Administration' },
          {
            name: 'Zug',
            type: 'link',
            value: false,
            subcomponents: [
              { name: 'Stationen', type: 'link', value: '/admin/train/stations' },
              { name: 'Anträge', type: 'link', value: '/admin/train/proposals' }
            ],
            separator: 'Administration'
          },
          { name: 'Benutzer', type: 'link', value: '/admin/users', subcomponents: false },

          { name: 'Sonstiges', type: 'separator' },
          { name: 'Profile', type: 'link', value: '/profile', subcomponents: false, separator: 'Sonstiges' },
          { name: 'Logout', type: 'link', value: '/logout', subcomponents: false }
        ]
      } else {
        components = [
          { name: 'Login', type: 'link', value: '/login', subcomponents: false }
        ]
      }

      return components
       */
    }
  }
}
</script>
