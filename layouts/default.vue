<script>
    import 'vue-form-wizard/dist/vue-form-wizard.min.css';

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
