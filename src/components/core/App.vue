<script>
import Vue from "vue";
import {BootstrapVue, BButton, BCollapse} from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../../assets/css/root.css';

import pageSidebar from "./Sidebar";
import pageFooter from "./Footer";
import pageNews from "./News";

Vue.use(BootstrapVue);

export default {
  name: 'App',
    // eslint-disable-next-line vue/no-unused-components
  components: {pageNews, pageFooter, pageSidebar, BButton, BCollapse},
  computed: {

  }
}
</script>

<template>
  <div id="app">
    <div class="page-wrapper">
        <page-sidebar></page-sidebar>
        <div class="page-content">
            <router-view></router-view>
        </div>
    </div>
    <page-footer></page-footer>
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
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
