import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import TradeDashboard from '../components/TradeDashboard.vue'
import HistoryPage from '../pages/HistoryPage.vue'
import SettingsPage from '../pages/SettingsPage.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,   // ✅ 공통 틀
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: TradeDashboard },
      { path: 'history', component: HistoryPage },
      { path: 'settings', component: SettingsPage },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})