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
        <h1>회원가입</h1>
        <p>Matrix Trade Bot 시작하기</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="field">
          <label class="field-label">이름</label>
          <input
            v-model="form.name"
            type="text"
            class="field-input"
            placeholder="홍길동"
            required
            autocomplete="name"
          />
        </div>

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
              placeholder="8자 이상 입력"
              required
              minlength="8"
              autocomplete="new-password"
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
          <!-- Password Strength -->
          <div class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill" :style="{ width: strengthPercent + '%' }" :class="strengthClass"></div>
            </div>
            <span class="strength-text" :class="strengthClass">{{ strengthLabel }}</span>
          </div>
        </div>

        <div class="field">
          <label class="field-label">비밀번호 확인</label>
          <input
            v-model="form.passwordConfirm"
            :type="showPassword ? 'text' : 'password'"
            class="field-input"
            placeholder="비밀번호 다시 입력"
            required
            autocomplete="new-password"
          />
          <span v-if="form.passwordConfirm && !passwordMatch" class="field-error">비밀번호가 일치하지 않습니다</span>
        </div>

        <!-- Error Message -->
        <transition name="fade">
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        </transition>

        <!-- Success Message -->
        <transition name="fade">
          <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
        </transition>

        <button type="submit" class="btn-primary" :disabled="isLoading || !canSubmit">
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? '가입 중...' : '회원가입' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="divider">
        <span>또는</span>
      </div>

      <!-- Login Link -->
      <p class="auth-link">
        이미 계정이 있으신가요?
        <router-link to="/login">로그인</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupPage',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
      showPassword: false,
      isLoading: false,
      errorMsg: '',
      successMsg: '',
    }
  },
  computed: {
    passwordMatch() {
      return this.form.password === this.form.passwordConfirm
    },
    passwordStrength() {
      const pw = this.form.password
      if (!pw) return 0
      let score = 0
      if (pw.length >= 8) score++
      if (pw.length >= 12) score++
      if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
      if (/\d/.test(pw)) score++
      if (/[^a-zA-Z0-9]/.test(pw)) score++
      return Math.min(score, 4)
    },
    strengthPercent() {
      return this.passwordStrength * 25
    },
    strengthLabel() {
      const labels = ['', '약함', '보통', '강함', '매우 강함']
      return labels[this.passwordStrength] || ''
    },
    strengthClass() {
      const classes = ['', 'weak', 'fair', 'good', 'strong']
      return classes[this.passwordStrength] || ''
    },
    canSubmit() {
      return (
        this.form.name.trim() &&
        this.form.email.trim() &&
        this.form.password.length >= 8 &&
        this.passwordMatch
      )
    },
  },
  methods: {
    async handleSignup() {
      if (this.isLoading || !this.canSubmit) return
      this.errorMsg = ''
      this.successMsg = ''
      this.isLoading = true

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.form.name,
            email: this.form.email,
            password: this.form.password,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || '회원가입에 실패했습니다')
        }

        console.log('[Signup] 성공:', data)
        this.successMsg = '회원가입 완료! 로그인 페이지로 이동합니다...'

        setTimeout(() => {
          this.$router.push('/login')
        }, 1500)
      } catch (e) {
        console.error('[Signup] 실패:', e.message)
        this.errorMsg = e.message
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
@import "../assets/styles/trade-signupPage.css";
</style>
