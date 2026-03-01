<template>
  <div class="settings-page">
    <h2 class="settings-title">봇 설정</h2>

    <div class="settings-grid">
      <!-- Coin Select -->
      <div class="field">
        <label class="field-label">
          코인
          <span class="help" tabindex="0" aria-label="코인 종류 도움말">
            ?
            <span class="help-tooltip">
              
            </span>
          </span>
        </label>
        <select v-model="form.coin" class="field-input" disabled>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="XRP">XRP</option>
          <option value="SOL">SOL</option>
        </select>
      </div>

      <!-- Quantity -->
      <div class="field">
        <label class="field-label">
          구매 수량 (Quantity)
          <span class="help" tabindex="0" aria-label="구매 수량 도움말">
            ?
            <span class="help-tooltip">
              매수할 때 몇 개 살지를 의미
            </span>
          </span>
        </label>
        <input
          v-model.number="form.quantity"
          type="number"
          step="0.00000001"
          min="0"
          class="field-input"
          placeholder="0.0001"
        />
      </div>

      <!-- k -->
      <div class="field">
        <label class="field-label">
          k (볼린저밴드 계수)
          <span class="help" tabindex="0" aria-label="볼린저밴드 계수 도움말">
            ?
            <span class="help-tooltip">
              targetPrice = 오늘 시가(open) + 어제 변동폭(range) * k
              k가 커지면?
              <br>
              range * k가 커져서 목표가가 더 위로 올라감
              <br>
              즉 “더 크게 오를 때만 매수” 하게 됨
              <br>
              장점: 쓸데없는 매수 줄어듦(보수적)
              <br>
              단점: 매수 기회 자체가 줄어듦(신호 적음)
              <br>
              k가 작아지면?
              <br>
              목표가가 낮아져서 “조금만 올라와도 매수”
              <br>
              장점: 신호 많아짐
              <br>
              단점: 잡매수 많아질 수 있음
            </span>
          </span>
        </label>
        <input
          v-model.number="form.k"
          type="number"
          step="0.1"
          min="0"
          class="field-input"
          placeholder="2.0"
        />
      </div>

      <!-- Take Profit -->
      <div class="field">
        <label class="field-label">
          Take Profit (%)
          <span class="help" tabindex="0" aria-label="Take Profit 도움말">
            ?
            <span class="help-tooltip">
              “내가 산 가격(평균매수가) 대비 몇 % 오르면 팔지” 설정.
            </span>
          </span>
        </label>
        <input
          v-model.number="form.takeProfit"
          type="number"
          step="0.1"
          min="0"
          class="field-input"
          placeholder="1.5"
        />
      </div>

      <!-- Stop Loss -->
      <div class="field">
        <label class="field-label">
          Stop Loss (%)
          <span class="help" tabindex="0" aria-label="Stop Loss 도움말">
            ?
            <span class="help-tooltip">
              “내가 산 가격 대비 몇 % 떨어지면 손절할지” 설정.
            </span>
          </span>
        </label>
        <input
          v-model.number="form.stopLoss"
          type="number"
          step="0.1"
          min="0"
          class="field-input"
          placeholder="1.0"
        />
      </div>

      <!-- Tick Ms -->
      <div class="field">
        <label class="field-label">
          Tick 간격 (ms)
          <span class="help" tabindex="0" aria-label="Tick 간격 도움말">
            ?
            <span class="help-tooltip">
              봇이 “판단/주문”을 몇 ms마다 할지
            </span>
          </span>
        </label>
        <input
          v-model.number="form.tickMs"
          type="number"
          step="100"
          min="100"
          class="field-input"
          placeholder="1000"
        />
      </div>
    </div>

    <!-- Save Button -->
    <button class="btn-save" @click="save" :disabled="isSaving">
      {{ isSaving ? '저장 중...' : '설정 저장' }}
    </button>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="showToast" class="toast">저장됨</div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SettingPage',
  data() {
    return {
      form: {
        coin: 'BTC',
        quantity: 0.0001,
        k: 2.0,
        takeProfit: 1.5,
        stopLoss: 1.0,
        tickMs: 1000,
      },
      isSaving: false,
      showToast: false,
    }
  },
  methods: {
    async save() {
      if (this.isSaving) return
      this.isSaving = true

      try {
        const res = await fetch('/api/trade/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        console.log('[Settings] 저장됨:', JSON.stringify(this.form))
        this.showToast = true
        setTimeout(() => {
          this.showToast = false
        }, 2000)
      } catch (e) {
        console.error('[Settings] 저장 실패:', e.message)
        alert('저장 실패: ' + e.message)
      } finally {
        this.isSaving = false
      }
    },
    async loadSettings() {
      try {
        const res = await fetch('/api/trade/settings')
        if (!res.ok) return
        const data = await res.json()
        Object.assign(this.form, data)
      } catch (e) {
        console.log('[Settings] 기존 설정 로드 실패:', e.message)
      }
    },
  },
  mounted() {
    this.loadSettings()
  },
}
</script>

<style scoped>
@import "../assets/styles/trade-settingsPage.css";
</style>