<template>
  <div class="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
    <MatrixEffect />
    
    <!-- 고정 박스 -->
    <div>
      <TradeDashboard />
      
      <!-- 예시: 로그 박스 -->
      <div class="mt-4 flex-1 overflow-auto">
        <ul>
          <li v-for="(l, idx) in logs" :key="idx">{{ l }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import MatrixEffect from './components/MatrixEffect.vue'
import TradeDashboard from './components/TradeDashboard.vue'
export default { components: { MatrixEffect, TradeDashboard } }
</script>

