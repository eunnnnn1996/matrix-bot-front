<template>
  <div class="stats-page">

    <!-- 기간 선택 -->
    <div class="period-bar">
        <button
          v-for="p in periods"
          :key="p.value"
          class="period-chip"
          :class="{ active: activePeriod === p.value }"
          @click="changePeriod(p.value)"
        >
          {{ p.label }}
        </button>

      <div class="period-spacer"></div>

      <button class="btn-refresh" @click="fetchStats" :disabled="isLoading">
        새로고침
      </button>
    </div>

    <!-- KPI -->
    <div class="kpi-row">

      <div class="kpi-card">
        <span class="kpi-label">실현 수익</span>
        <span class="kpi-value" :class="stats.totalProfit >= 0 ? 'up':'down'">
          {{ fmt(stats.totalProfit) }}원
        </span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">승률</span>
        <span class="kpi-value">
          {{ stats.winRate }}%
        </span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">거래 수</span>
        <span class="kpi-value neutral">
          {{ stats.totalTrade }}건
        </span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">평균 수익</span>
        <span class="kpi-value">
          {{ fmt(stats.avgProfit) }}원
        </span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">최대 수익</span>
        <span class="kpi-value up">
          {{ fmt(stats.maxProfit) }}원
        </span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">최대 손실</span>
        <span class="kpi-value down">
          {{ fmt(stats.minLoss) }}원
        </span>
      </div>

    </div>


    <!-- 차트 영역 -->
    <div class="chart-row">

      <!-- 누적 수익 -->
      <div class="card chart-card wide">

        <div class="card-header">
          <span class="card-title">누적 수익</span>
        </div>

        <div class="chart-area">

          <div v-if="stats.cumulative.length === 0" class="chart-empty">
            데이터 없음
          </div>

          <svg v-else class="line-chart" viewBox="0 0 600 200">

            <polyline
              fill="none"
              stroke="#10b981"
              stroke-width="2"
              :points="linePoints"
            />

          </svg>

        </div>

      </div>


      <!-- 승패 비율 -->
      <div class="card chart-card narrow">

        <div class="card-header">
          <span class="card-title">승/패 비율</span>
        </div>

        <div class="donut-wrap">

          <svg viewBox="0 0 120 120" class="donut">

            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#1f2937"
              stroke-width="12"
            />

            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#10b981"
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="winDash"
              stroke-dashoffset="78.5"
              transform="rotate(-90 60 60)"
            />

          </svg>

          <div class="donut-center">
            <span class="donut-pct">{{ stats.winRate.toFixed(0) }}%</span>
            <span class="donut-sub">승률</span>
          </div>

        </div>

        <div class="donut-legend">

          <div class="legend-item">
            <span class="legend-dot win"></span>
            <span>익절 {{ stats.winCount }}건</span>
          </div>

          <div class="legend-item">
            <span class="legend-dot loss"></span>
            <span>손절 {{ stats.lossCount }}건</span>
          </div>

        </div>

      </div>

    </div>


    <!-- 일별 수익 -->
    <div class="card">

      <div class="card-header">
        <span class="card-title">일별 수익</span>
      </div>

      <div class="daily-bars">

        <div
          v-for="d in stats.daily"
          :key="d.date"
          class="daily-row"
        >

          <span class="daily-date">{{ d.date }}</span>

          <div class="daily-bar-track">
            <div
              class="daily-bar-fill"
              :class="d.pnl >= 0 ? 'up':'down'"
              :style="{ width: barWidth(d.pnl)+'%' }"
            ></div>
          </div>

          <span class="daily-val">
            {{ fmt(d.pnl) }}
          </span>

          <span class="daily-cnt">
            {{ d.count }}건
          </span>

        </div>

      </div>

    </div>


    <!-- TOP 거래 -->
    <div class="two-col">

      <div class="card">

        <div class="card-header">
          <span class="card-title">최고 수익 거래</span>
        </div>

        <div
          v-for="t in stats.topWins"
          :key="t.id"
          class="top-item"
        >
          <span>{{ t.coin }}</span>
          <span class="up">+{{ fmt(t.pnl) }}원</span>
        </div>

      </div>


      <div class="card">

        <div class="card-header">
          <span class="card-title">최대 손실 거래</span>
        </div>

        <div
          v-for="t in stats.topLosses"
          :key="t.id"
          class="top-item"
        >
          <span>{{ t.coin }}</span>
          <span class="down">{{ fmt(t.pnl) }}원</span>
        </div>

      </div>

    </div>

  </div>
</template>


<script>
export default {

  name: "StatsPage",

  data() {
    return {

      stats: {
        totalProfit: 0,
        winRate: 0,
        totalTrade: 0,
        avgProfit: 0,
        maxProfit: 0,
        minLoss: 0,
        profitCnt: 0,
        totalProfit: 0,
        winCount: 0,
        lossCount: 0,
        cumulative: [],
        daily: [],
        topWins: [],
        topLosses: []
      },

      activePeriod: "all",

      periods: [
        { label: "24시간", value: "1d" },
        { label: "7일", value: "7d" },
        { label: "30일", value: "30d" },
        { label: "전체", value: "all" }
      ],

      isLoading: false
    }
  },

  computed: {

    winDash() {

      const total = this.stats.winCount + this.stats.lossCount
      if (!total) return "0 314"

      const circ = 2 * Math.PI * 50
      const winPart = (this.stats.winCount / total) * circ

      return `${winPart} ${circ}`
    },

    linePoints() {

      const data = this.stats.cumulative
      if (!data.length) return ""

      const max = Math.max(...data)
      const min = Math.min(...data)

      const width = 600
      const height = 200
      const range = max - min || 1

      return data.map((v,i)=>{

        const x = (i/(data.length-1))*width
        const y = height - ((v-min)/range)*height

        return `${x},${y}`

      }).join(" ")
    }

  },

  methods: {

    fmt(n){
      return Math.floor(n).toLocaleString("ko-KR")
    },

    barWidth(pnl){

      const max = Math.max(
        ...this.stats.daily.map(d=>Math.abs(d.pnl)),
        1
      )

      return Math.min((Math.abs(pnl)/max)*100,100)
    },

    changePeriod(p){
      this.activePeriod = p
      this.fetchStats()
    },

  async fetchStats(){

    this.isLoading = true

      try{

        const res = await fetch(`/api/getProfit?period=${this.activePeriod}`)
        const data = await res.json()

        this.stats.totalProfit = data.totalProfit
        this.stats.winRate = data.winRate
        this.stats.totalTrade = data.totalTrade
        this.stats.avgProfit = data.avgProfit
        this.stats.maxProfit = data.maxProfit
        this.stats.minLoss = data.minLoss
        this.stats.profitCnt = data.profitCnt
      }catch(e){
        console.error(e)
      }finally{
        this.isLoading = false
      }
    }

  },

  mounted(){

    this.fetchStats()

  }

}
</script>


<style scoped>
@import "../assets/styles/trade-statsPage.css";
</style>