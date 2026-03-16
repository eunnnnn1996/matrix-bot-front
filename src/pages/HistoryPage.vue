<template>
  <div class="history-page">

    <!-- Summary Cards -->
    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">총 거래</span>
        <span class="summary-value">{{ totalElements }}건</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">매수</span>
        <span class="summary-value buy">{{ buyCount }}건</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">매도</span>
        <span class="summary-value sell">{{ sellCount }}건</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">실현 수익</span>
        <span class="summary-value" :class="totalPnl >= 0 ? 'profit' : 'loss'">
          {{ totalPnl >= 0 ? '+' : '' }}{{ Math.floor(totalPnl).toLocaleString('ko-KR') }}원
        </span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-left">
        <button
          v-for="f in sideFilters"
          :key="f.value"
          class="filter-chip"
          :class="{ active: sideFilter === f.value }"
          @click="sideFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="filter-right">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="가격/수량 검색..."
        />

        <button class="btn-refresh" @click="fetchTrades" :disabled="isLoading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">

      <!-- Loading -->
      <div v-if="isLoading" class="table-empty">
        <div class="spinner"></div>
        <span>불러오는 중...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredTrades.length === 0" class="table-empty">
        <span>거래 내역이 없습니다</span>
      </div>

      <!-- Data Table -->
      <div v-else class="table-scroll">
        <table class="trade-table">
          <thead>
            <tr>
              <th>시간</th>
              <th>코인</th>
              <th>구분</th>
              <th class="right">매매 시세 (KRW)</th>
              <th class="right">매매 수량</th>
              <th class="right">매매 가격 (KRW)</th>
              <th class="right">수익</th>
            </tr>
          </thead>

          <tbody>
            <!-- ⭐ 서버 페이징이라 filteredTrades만 -->
            <tr v-for="t in filteredTrades" :key="t.id">
              <td class="cell-time">{{ formatTime(t.createdAt) }}</td>

              <td>
                <span class="coin-badge">{{ t.coin || 'BTC' }}</span>
              </td>

              <td>
                <span class="side-tag" :class="t.side === 'BUY' ? 'buy' : 'sell'">
                  {{ t.side === 'BUY' ? '매수' : '매도' }}
                </span>
              </td>

              <td class="right mono">
                {{ Number(t.price).toLocaleString('ko-KR') }}
              </td>

              <td class="right mono">
                {{ Number(t.qty).toFixed(8) }}
              </td>

              <td class="right mono">
                {{ Math.floor(t.price * t.qty).toLocaleString('ko-KR') }}
              </td>

              <td class="right mono"
              :class="t.side === 'SELL'
                ? ((Number(t.profit ?? 0)) >= 0 ? 'profit' : 'loss')
                : ''"
            >
              {{ formatProfit(t) }}
            </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">

        <button
          class="page-btn"
          :disabled="page <= 0"
          @click="changePage(page - 1)"
        >
          ◀
        </button>

        <span class="page-info">
          {{ page + 1 }} / {{ totalPages }}
        </span>

        <button
          class="page-btn"
          :disabled="page >= totalPages - 1"
          @click="changePage(page + 1)"
        >
          ▶
        </button>

      </div>
    </div>
  </div>
</template>

<script>
import api from "../api/axios"
export default {
  name: 'HistoryPage',

  data() {
    return {
      trades: [],
      isLoading: false,

      // ⭐ 서버 페이징
      page: 0,
      size: 10,
      totalPages: 1,
      totalElements: 0, // ⭐ 전체 거래 수

      sideFilter: 'ALL',
      searchQuery: '',

      sideFilters: [
        { label: '전체', value: 'ALL' },
        { label: '매수', value: 'BUY' },
        { label: '매도', value: 'SELL' },
      ],
    }
  },

  computed: {
    filteredTrades() {
      let list = this.trades

      if (this.sideFilter !== 'ALL') {
        list = list.filter(t => t.side === this.sideFilter)
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()

        list = list.filter(t =>
          String(t.price).includes(q) ||
          String(t.qty).includes(q) ||
          (t.coin || 'BTC').toLowerCase().includes(q)
        )
      }

      return list
    },

    buyCount() {
      return this.filteredTrades.filter(t => t.side === 'BUY').length
    },

    sellCount() {
      return this.filteredTrades.filter(t => t.side === 'SELL').length
    },

    totalPnl() {
      return this.filteredTrades.reduce(
        (sum, t) => sum + Number(t.profit ?? 0),
        0
      )
    },
  },

  methods: {

    formatTime(iso) {
      if (!iso) return '-'

      const d = new Date(iso)

      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      const ss = String(d.getSeconds()).padStart(2, '0')

      return `${mm}-${dd} ${hh}:${mi}:${ss}`
    },

    async fetchTrades() {

    this.isLoading = true

    try {

      const res = await api.get(
        `/api/events?page=${this.page}&size=${this.size}&sort=createdAt,desc`
      )

      const data = res.data

      // Spring Page 구조
      this.trades = data.content || []
      this.totalPages = data.totalPages || 1
      this.totalElements = data.totalElements || 0

    } catch (e) {

      console.error('[HistoryPage] fetch failed:', e.message)
      this.trades = []

    } finally {

      this.isLoading = false

    }

  },

    changePage(p) {
      if (p < 0 || p >= this.totalPages) return
      this.page = p
      this.fetchTrades()
    },
    formatProfit(trade) {
      if (trade.side === 'BUY') return '-'
      const p = Number(trade.profit ?? 0)
      if (isNaN(p)) return '-'
      return (p >= 0 ? '+' : '') +
            Math.floor(p).toLocaleString('ko-KR')
    }
  },

  mounted() {
    this.fetchTrades()
  },
}
</script>

<style scoped>
@import "../assets/styles/trade-historyPage.css";
</style>
