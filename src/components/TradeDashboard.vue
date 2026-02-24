<template>
  <div class="dashboard">
    <!-- Header -->

    <main class="main">
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
          <button class="btn primary"
                  @click="refreshDashboard"
                  :disabled="isRefreshing">
            {{ isRefreshing ? '새로고침 중...' : '잔액 새로고침' }}
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
            <span class="tag">{{ String(log.type || '').toUpperCase() }}</span>
            <span class="msg">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'TradeDashboard',
  data() {
    return {
      krwBalance: 0,
      btcBalance: 0,
      isRunning: false,
      lastUpdate: '-',
      logs: [],
      todayProfit: 0,
      totalAssetsKrw: 0,
      totalProfit: 0,
      isRefreshing: false,
      startId: 0,
      lastId: 0,
      liveTimer: null,
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
        ...extra,
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
        const krw = data.find((v) => v.currency === 'KRW')
        const btc = data.find((v) => v.currency === 'BTC')
        this.krwBalance = krw ? Number(krw.balance) : 0
        this.btcBalance = btc ? Number(btc.balance) : 0
        this.lastUpdate = new Date().toLocaleString('ko-KR')
        this.addLog('잔액 조회 완료', 'success', {
          krwBalance: this.krwBalance,
          btcBalance: this.btcBalance,
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
          this.clearLogs()
          await fetch('/api/trade/bot/start', { method: 'POST' })
          this.isRunning = true
          await this.fetchStartId()
          if (this.liveTimer) {
            clearInterval(this.liveTimer)
          }
          this.liveTimer = setInterval(() => {
            this.fetchLiveLogs()
          }, 1500)
          this.addLog('봇 시작 요청 성공', 'success')
        } else {
          await fetch('/api/trade/bot/stop', { method: 'POST' })
          this.isRunning = false
          clearInterval(this.liveTimer)
          this.liveTimer = null
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

        this.todayProfit = Number(data.todayRealizedPnl ?? 0)

        this.addLog('오늘 수익 조회 완료', 'success')
      } catch (e) {
        this.addLog('오늘 수익 조회 실패: ' + e.message, 'error')
      }
    },
    async fetchTotalProfit() {
      try {
        const res = await fetch('/api/trade/total-profit?coin=BTC')
        const data = await res.json()

        this.totalProfit = Number(data.totalRealizedPnl ?? 0)

        this.addLog('총 수익 조회 완료', 'success')
      } catch (e) {
        this.addLog('총 수익 조회 실패: ' + e.message, 'error')
      }
    },
    async fetchStartId() {
      try {
        const res = await fetch('/api/trade/start-id?coin=BTC')
        const startId = await res.json()

        this.startId = startId
        this.lastId = startId

        this.addLog(`시작 ID 설정: ${startId}`, 'info')
      } catch (e) {
        this.addLog('startId 조회 실패: ' + e.message, 'error')
      }
    },
    async fetchLiveLogs() {
      try {
        const res = await fetch(
          `/api/trade/liveLogs?coin=BTC&afterId=${this.lastId}`
        )
        const logs = await res.json()
        if (logs.length > 0) {
          logs.forEach(log => {
            this.addLog(
              `${log.side} ${log.qty} BTC @ ${log.price}`,
              log.side === 'BUY' ? 'success' : 'danger'
            )
          })
          // 마지막 ID 갱신 ⭐⭐⭐
          this.lastId = logs[logs.length - 1].id
        }
      } catch (e) {
        this.addLog('실시간 로그 조회 실패: ' + e.message, 'error')
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
    },
    async refreshDashboard() {
      if (this.isRefreshing) return
      this.isRefreshing = true

      try {
        await Promise.all([
          this.fetchBalance(),
          this.fetchTodayProfit(),
          this.fetchTotalAssets(),
          this.fetchTotalProfit(),
          this.fetchBotStatus(),
        ])
      } finally {
        this.isRefreshing = false
      }
    },
  },
  mounted() {
    this.addLog('대시보드 초기화', 'info')
    this.refreshDashboard()
  },
}
</script>

<style scoped>
@import "../assets/styles/trade-dashboard.css";
</style>