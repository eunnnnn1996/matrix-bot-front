<template>
  <div class="dashboard">
    <!-- ✅ 항상 유지되는 Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            </svg>
          </div>
          <div>
            <h1>Matrix Trade Bot</h1>
            <p>추세 + 되돌림 자동매매</p>
          </div>
        </div>
      </div>

      <!-- ✅ 메뉴도 항상 유지 -->
      <nav class="menu-tabs" aria-label="dashboard tabs">
        <router-link class="tab" to="/dashboard" active-class="active">대시보드</router-link>
        <router-link class="tab" to="/history" active-class="active">거래내역</router-link>
        <router-link class="tab" to="/stats" active-class="active">통계</router-link>
        <router-link class="tab" to="/settings" active-class="active">설정</router-link>
        <div class="tab-spacer"></div>
      </nav>
    </header>

    <!-- ✅ 여기만 페이지가 바뀜 -->
    <main class="main">
      <router-view />
    </main>

    <!-- ✅ 항상 유지되는 Footer -->
    <footer class="footer">Matrix Trade Bot v2.0</footer>
  </div>
</template>

<script>
export default { name: 'AppLayout' }
</script>

<style scoped>
@import "../assets/styles/trade-dashboard.css";
</style>