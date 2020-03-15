import PageNotFound from '../components/error/PageNotFound'
import Login from '../components/Login'
import Logout from '../components/Logout'
import Dashboard from '../components/Dashboard'

const routes = [
  {
    path: '*',
    component: PageNotFound
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresGuestState: true
    }
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  }
]

export default routes
