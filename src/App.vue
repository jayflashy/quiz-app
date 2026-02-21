<script setup>
import { ref, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const isDarkMode = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('quizTheme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
})

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('quizTheme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('quizTheme', 'light')
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center p-4 selection:bg-indigo-300">

    <!-- Theme Toggle -->
    <button @click="toggleTheme"
      class="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-50 transition-all duration-300 transform hover:scale-110 active:scale-95 border-2"
      :class="isDarkMode ? 'bg-gray-800 text-yellow-400 border-gray-700' : 'bg-white text-indigo-600 border-gray-100'"
      aria-label="Toggle theme">
      <Sun v-if="isDarkMode" class="w-6 h-6" />
      <Moon v-else class="w-6 h-6" />
    </button>

    <router-view></router-view>
  </div>
</template>
