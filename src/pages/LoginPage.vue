<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          </svg>
        </div>
        <h1>Matrix Trade Bot</h1>
        <p>추세 + 되돌림 자동매매</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="field">
          <label class="field-label">이메일</label>
          <input
            v-model="form.email"
            type="email"
            class="field-input"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label class="field-label">비밀번호</label>
          <div class="password-wrap">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              placeholder="********"
              required
              autocomplete="current-password"
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <transition name="fade">
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        </transition>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="divider">
        <span>또는</span>
      </div>

      <!-- Sign Up Link -->
      <p class="auth-link">
        계정이 없으신가요?
        <router-link to="/signup">회원가입</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      showPassword: false,
      isLoading: false,
      errorMsg: '',
    }
  },
  methods: {
    async handleLogin() {
      if (this.isLoading) return
      this.errorMsg = ''
      this.isLoading = true

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || '로그인에 실패했습니다')
        }

        console.log('[Login] 성공:', data)
        this.$router.push('/dashboard')
      } catch (e) {
        console.error('[Login] 실패:', e.message)
        this.errorMsg = e.message
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
@import "../assets/styles/trade-loginPage.css";
</style>
