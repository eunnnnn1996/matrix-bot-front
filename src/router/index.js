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
    component: AppLayout,   // ✅ 공통 틀
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard' , component: TradeDashboard },
      { path: 'history'   , component: HistoryPage },
      { path: 'settings'  , component: SettingsPage },
      { path: 'stats'     , component: StatsPage },
      { path: 'login'     , component: LoginPage },
      { path: 'signup'    , component: SignupPage },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})