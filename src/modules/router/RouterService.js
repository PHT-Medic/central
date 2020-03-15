import Vue from 'vue'
import Router from 'vue-router'

import register from '../../routes/regsitry'
import routerGuard from './RouterGuard'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: register
})

routerGuard(router)

export default router
