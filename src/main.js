import Vue from 'vue'

// Load vuex modules
import store from './store'

// Load services
import router from './modules/router/RouterService'
import { ApiService } from './modules/ApiService'
import { AuthService } from './modules/auth/AuthService'

// Load root component
import App from './components/core/App.vue'

// General settings
Vue.config.productionTip = false

// Check access token and in case set header.
ApiService.init('http://localhost:7001')
AuthService.checkRequestToken()

// Init vue app.
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')

store.dispatch('auth/refreshMe')
