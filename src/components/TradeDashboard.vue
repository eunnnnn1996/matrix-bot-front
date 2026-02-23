<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            </svg>
          </div>
          <div>
            <h1>Matrix Trade Bot</h1>
            <p>추세 + 되돌림 자동매매</p>
          </div>
        </div>
        <div class="status-badge" :class="isRunning ? 'running' : 'stopped'">
          <span class="dot"></span>
          {{ isRunning ? '실행 중' : '정지됨' }}
        </div>
      </div>

      <!-- Menu Tabs -->
      <nav class="menu-tabs" aria-label="dashboard tabs">
        <button
          class="tab"
          :class="{ active: currentTab === 'dashboard' }"
          @click="currentTab = 'dashboard'"
          type="button"
        >
          대시보드
        </button>
        <button
          class="tab"
          :class="{ active: currentTab === 'history' }"
          @click="currentTab = 'history'"
          type="button"
        >
          거래내역
        </button>
        <button
          class="tab"
          :class="{ active: currentTab === 'settings' }"
          @click="currentTab = 'settings'"
          type="button"
        >
          설정
        </button>
        <div class="tab-spacer"></div>
      </nav>
    </header>

    <main class="main">
      <!-- DASHBOARD TAB -->
      <template v-if="currentTab === 'dashboard'">
        <!-- Stats -->
        <div class="stats">
          <!-- 봇 상태 -->
          <div class="card">
            <div class="card-title">봇 상태</div>
            <div class="status-display">
              <div class="indicator" :class="{ active: isRunning }"></div>
              <div>
                <strong>{{ isRunning ? 'ACTIVE' : 'INACTIVE' }}</strong>
                <span>자동매매 {{ isRunning ? '활성화' : '비활성화' }}</span>
              </div>
            </div>
          </div>

          <!-- KRW 잔액 -->
          <div class="card">
            <div class="card-title">KRW 잔액</div>
            <div class="balance">
              <span class="amount">{{ Math.floor(krwBalance).toLocaleString('ko-KR') }}</span>
              <span class="loading"></span>
              <span class="unit">원</span>
            </div>
          </div>

          <!-- BTC 잔액 -->
          <div class="card">
            <div class="card-title">BTC 잔액</div>
            <div class="balance btc">
              <span class="amount">{{ formatBtc(btcBalance) }}</span>
              <span class="unit">BTC</span>
            </div>
          </div>

          <!-- 총 자산 -->
          <div class="card">
            <div class="card-title">총 자산</div>
            <div class="balance">
              <span class="amount">{{ Math.floor(totalAssetsKrw).toLocaleString('ko-KR') }}</span>
              <span class="unit">원</span>
            </div>
          </div>

          <!-- 총 수익 -->
          <div class="card">
            <div class="card-title">총 수익</div>
            <div class="balance">
              <span class="amount">{{ Math.floor(totalProfit).toLocaleString('ko-KR') }}</span>
              <span class="unit">원</span>
            </div>
          </div>

          <!-- 오늘 수익 -->
          <div class="card">
            <div class="card-title">오늘 수익</div>
            <div class="balance">
              <span class="amount">{{ Math.floor(todayProfit).toLocaleString('ko-KR') }}</span>
              <span class="unit">원</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <div class="buttons">
            <button class="btn primary" @click="fetchBalance">
              잔액 새로고침
            </button>
            <button class="btn" :class="isRunning ? 'danger' : 'success'" @click="toggleBot">
              {{ isRunning ? '봇 정지' : '봇 시작' }}
            </button>
          </div>
          <span class="update-time">마지막 업데이트: {{ lastUpdate }}</span>
        </div>

        <!-- Logs -->
        <div class="card logs">
          <div class="log-header">
            <span class="card-title">실시간 로그 ({{ logs.length }})</span>
            <button class="btn-text" @click="clearLogs">지우기</button>
          </div>
          <div class="log-list">
            <div v-if="logs.length === 0" class="log-empty">로그가 없습니다</div>
            <div v-for="(log, i) in logs" :key="i" class="log-item" :class="log.type">
              <span class="time">{{ log.time }}</span>
              <span class="tag">{{ log.type.toUpperCase() }}</span>
              <span class="msg">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- HISTORY TAB (UI만 자리 잡아둠) -->
      <template v-else-if="currentTab === 'history'">
        <div class="card">
          <div class="card-title">거래내역</div>
          <p class="tab-desc">
            여기에는 BUY/SELL 기록 테이블 붙이면 됨. (지금은 탭만 추가)
          </p>
          <div class="empty-box">
            아직 거래내역 화면이 없습니다.
          </div>
        </div>
      </template>

      <!-- SETTINGS TAB (UI만 자리 잡아둠) -->
      <template v-else-if="currentTab === 'settings'">
        <div class="card">
          <div class="card-title">설정</div>
          <p class="tab-desc">
            k / 익절 / 손절 같은 값 입력 UI 붙이면 됨. (지금은 탭만 추가)
          </p>
          <div class="empty-box">
            아직 설정 화면이 없습니다.
          </div>
        </div>
      </template>
    </main>

    <footer class="footer">Matrix Trade Bot v2.0</footer>
  </div>
</template>

<script>
export default {
  name: 'TradingDashboard',
  data() {
    return {
      currentTab: 'dashboard', // ✅ 탭 상태 추가
      krwBalance: 0,
      btcBalance: 0,
      isRunning: false,
      lastUpdate: '-',
      logs: [],
      todayProfit: 0,
      totalAssetsKrw: 0,
      totalProfit: 0
    }
  },
  methods: {
    formatBtc(num) {
      return Number(num).toFixed(8)
    },
    addLog(message, type = 'info', extra = {}) {
      const time = new Date().toLocaleTimeString('ko-KR')
      this.logs.unshift({
        time,
        message,
        type,
        ...extra
      })
      if (this.logs.length > 100) this.logs.pop()
    },
    clearLogs() {
      this.logs = []
    },
    async fetchBalance() {
      try {
        const res = await fetch('/api/trade/balance')
        const data = await res.json()
        const krw = data.find(v => v.currency === 'KRW')
        const btc = data.find(v => v.currency === 'BTC')
        this.krwBalance = krw ? Number(krw.balance) : 0
        this.btcBalance = btc ? Number(btc.balance) : 0
        this.lastUpdate = new Date().toLocaleString('ko-KR')
        this.addLog('잔액 조회 완료', 'success', {
          krwBalance: this.krwBalance,
          btcBalance: this.btcBalance
        })
      } catch (e) {
        this.addLog('잔액 조회 실패: ' + e.message, 'error')
      }
    },
    async fetchTotalAssets() {
      try {
        const res = await fetch('/api/trade/total-assets')
        const data = await res.json()

        this.totalAssetsKrw = Number(data.totalAssetsKrw ?? 0)

        this.addLog('총 잔액 조회 완료', 'success', {
          totalAssetsKrw: this.totalAssetsKrw,
        })
      } catch (e) {
        this.addLog('총 잔액 조회 실패: ' + e.message, 'error')
      }
    },
    async toggleBot() {
      try {
        if (!this.isRunning) {
          await fetch('/api/trade/bot/start', { method: 'POST' })
          this.isRunning = true
          this.addLog('봇 시작 요청 성공', 'success')
        } else {
          await fetch('/api/trade/bot/stop', { method: 'POST' })
          this.isRunning = false
          this.addLog('봇 정지 요청 성공', 'success')
        }
      } catch (e) {
        this.addLog(`봇 제어 실패: ${e.message}`, 'error')
      }
    },
    async fetchTodayProfit() {
      try {
        const res = await fetch('/api/trade/today-profit?coin=BTC')
        const data = await res.json()

        this.todayProfit = data.todayRealizedPnl

        this.addLog('오늘 수익 조회 완료', 'success')
      } catch (e) {
        this.addLog('오늘 수익 조회 실패: ' + e.message, 'error')
      }
    },
    async fetchTotalProfit() {
      try {
        const res = await fetch('/api/trade/total-profit?coin=BTC')
        const data = await res.json()

        this.totalProfit = data.totalRealizedPnl

        this.addLog('총 수익 조회 완료', 'success')
      } catch (e) {
        this.addLog('총 수익 조회 실패: ' + e.message, 'error')
      }
    },
    async fetchBotStatus() {
      try {
        const res = await fetch('/api/trade/bot/status') 
        const data = await res.json()
        this.isRunning = !!data.running
        this.addLog(`봇 상태 동기화: ${this.isRunning ? 'RUNNING' : 'STOPPED'}`, 'info')
      } catch (e) {
        this.addLog('봇 상태 조회 실패: ' + e.message, 'error')
      }
    }
  },
  mounted() {
    this.addLog('대시보드 초기화', 'info')
    this.fetchBotStatus()
    this.fetchBalance()
    this.fetchTodayProfit()
    this.fetchTotalAssets()
    this.fetchTotalProfit()
  }
}
</script>

<style scoped>
@import "../assets/styles/trade-dashboard.css";
</style>
