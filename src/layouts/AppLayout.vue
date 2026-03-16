<template>
  <div class="dashboard">

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

      <nav class="menu-tabs">
        <router-link class="tab" to="/dashboard">대시보드</router-link>
        <router-link v-if="isLoggedIn" class="tab" to="/history">거래내역</router-link>
        <router-link v-if="isLoggedIn" class="tab" to="/stats">통계</router-link>
        <router-link v-if="isLoggedIn" class="tab" to="/settings">설정</router-link>
        <div class="tab-spacer"></div>
        <div class="auth-buttons">
          <template v-if="!isLoggedIn">
            <router-link class="auth-btn login" to="/login">로그인</router-link>
            <router-link class="auth-btn signup" to="/signup">회원가입</router-link>
          </template>
          <template v-else>
            <button class="auth-btn login" @click="logout">로그아웃</button>
          </template>
        </div>
      </nav>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      Matrix Trade Bot v2.0
    </footer>

  </div>
</template>

<script>
import api from "../api/axios"

export default {
  name: "AppLayout",

  data() {
    return {
      isLoggedIn: !!localStorage.getItem("accessToken")
    }
  },

  created() {

    this.loginHandler = () => {
      this.isLoggedIn = true
    }

    window.addEventListener("login-success", this.loginHandler)

  },

  beforeUnmount() {
    window.removeEventListener("login-success", this.loginHandler)
  },

  methods: {

    async logout() {

      const refreshToken = localStorage.getItem("refreshToken")

      try {
        await api.post("/auth/logout", {
          refreshToken: refreshToken
        })
      } catch(e) {
        console.log("logout api 실패")
      }

      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")

      this.isLoggedIn = false

      this.$router.push("/login")

    }

  }

}
</script>

<style scoped>
@import "../assets/styles/trade-dashboard.css";
</style>