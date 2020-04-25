<script>
import pageHeader from './header';
import pageSidebar from './sidebar';
import pageFooter from './footer';

export default {
  name: 'App',
  // eslint-disable-next-line vue/no-unused-components
  components: { pageFooter, pageSidebar, pageHeader },
  computed: {

  }
}
</script>

<template>
  <div id="app">
    <page-header />
    <div class="page-wrapper">
      <page-sidebar />
      <div class="page-content">
        <nuxt />
      </div>
    </div>
    <page-footer />
  </div>
</template>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
    }
</style>
