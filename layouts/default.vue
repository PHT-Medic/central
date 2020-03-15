<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import pageSidebar from './sidebar';
import pageFooter from './footer';

export default {
  name: 'App',
  // eslint-disable-next-line vue/no-unused-components
  components: { pageFooter, pageSidebar },
  computed: {

  }
}
</script>

<template>
  <div id="app">
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
        text-align: center;
        color: #2c3e50;
    }
</style>
