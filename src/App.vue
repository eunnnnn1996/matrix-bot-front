<template>
  <div class="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
    <MatrixEffect />

    <!-- 🔥 라우터가 여기 화면을 바꿔줌 -->
    <router-view />
  </div>
</template>

<script>
import MatrixEffect from './components/MatrixEffect.vue'

export default {
  components: {
    MatrixEffect
  }
}
</script>