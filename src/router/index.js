import { createRouter, createWebHistory } from 'vue-router'

import AppLayout        from '../layouts/AppLayout.vue'
import TradeDashboard   from '../components/TradeDashboard.vue'
import HistoryPage      from '../pages/HistoryPage.vue'
import SettingsPage     from '../pages/SettingsPage.vue'
import StatsPage        from '../pages/StatsPage.vue'
import LoginPage        from '../pages/LoginPage.vue'
import SignupPage       from '../pages/SignupPage.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [

      { path: '', redirect: '/dashboard' },

      {
        path: 'dashboard',
        component: TradeDashboard
      },

      {
        path: 'history',
        component: HistoryPage,
        meta: { requiresAuth: true }
      },

      {
        path: 'settings',
        component: SettingsPage,
        meta: { requiresAuth: true }
      },

      {
        path: 'stats',
        component: StatsPage,
        meta: { requiresAuth: true }
      },

      {
        path: 'login',
        component: LoginPage
      },

      {
        path: 'signup',
        component: SignupPage
      }

    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


// ⭐ Router Guard
router.beforeEach((to, from, next) => {

  const token = localStorage.getItem("accessToken")

  if (to.meta.requiresAuth && !token) {

    next("/login")

  } else {

    next()

  }

})

export default router