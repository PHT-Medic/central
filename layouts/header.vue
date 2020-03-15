<script>
import { mapGetters, mapActions } from 'vuex'
import { LayoutService } from '../services/layout';

export default {
  computed: {
    ...mapGetters('layout', [
      'navigationComponents',
      'sidebarId'
    ]),
    ...mapGetters('auth', [
      'loggedIn',
      'user'
    ]),
    components: (vm) => {
      return LayoutService.reduceComponents({
        components: vm.navigationComponents.map((component) => {
          component.active = 'sidebarId' in component && component.sidebarId === vm.sidebarId;
          return component
        }),
        loggedIn: vm.loggedIn
      })
    }
  },
  methods: {
    ...mapActions('layout', [
      'selectSidebar'
    ]),

    componentClick ($index) {
      const component = this.navigationComponents[$index];

      if (component.value === null) {
        if ('sidebarId' in component) {
          this.selectSidebar(component.sidebarId)
        }
      } else {
        this.$router.push(component.value)
      }
    }
  }
}
</script>
<template>
  <div>
    <header class="page-header fixed-top">
      <div class="header-title">
        <div class="toggle-box">
          <button v-b-toggle="'page-navbar'" type="button" class="toggle-trigger">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar" />
            <span class="icon-bar" />
            <span class="icon-bar" />
          </button>
        </div>
        <div class="logo">
          <span>P</span>H<span>T</span>
          <span class="info-text">Peronal Health Train</span>
        </div>
      </div>
      <nav class="page-navbar navbar-expand-md">
        <b-collapse id="page-navbar" class="navbar-content navbar-collapse">
          <ul class="navbar-nav navbar-links">
            <li v-for="(component,key) in components" :key="key" class="nav-item">
              <a v-if="!component.value" href="javascript:void(0)" class="nav-link" :class="{'router-link-active': component.active}" @click="componentClick(key)">
                <i v-if="component.icon" :class="component.icon" /> {{ component.name }}
              </a>
            </li>
          </ul>
          <ul v-if="loggedIn" class="navbar-nav navbar-gadgets">
            <li class="nav-item">
              <a class="nav-link user-link" href="javascript:void(0)">
                <img v-if="user.avatar" :src="user.avatar">
                <span>{{ user.name }}</span>
              </a>
            </li>
            <li class="nav-item">
              <nuxt-link :to="'/logout'" class="nav-link">
                <i class="fa fa-power-off" />
              </nuxt-link>
            </li>
          </ul>
        </b-collapse>
      </nav>
    </header>
  </div>
</template>
