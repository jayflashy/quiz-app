<script setup>
import { ref, computed, onUnmounted } from 'vue'
import allQuestions from './data/questions.json'

const questions = ref([])
const currentQuestionIndex = ref(0)
const score = ref(0)
const isFinished = ref(false)
const selectedAnswer = ref(null)
const showResult = ref(false)

const hasStarted = ref(false)
const timerMinutes = ref(15)
const timeRemaining = ref(0)
let timerInterval = null

const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60).toString().padStart(2, '0')
  const s = (timeRemaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const startQuiz = () => {
  // Shuffle questions
  questions.value = [...allQuestions].sort(() => Math.random() - 0.5)
  currentQuestionIndex.value = 0
  score.value = 0
  isFinished.value = false
  selectedAnswer.value = null
  showResult.value = false
  hasStarted.value = true

  timeRemaining.value = timerMinutes.value * 60
  clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      endQuiz()
    }
  }, 1000)
}

const endQuiz = () => {
  isFinished.value = true
  clearInterval(timerInterval)
}

onUnmounted(() => {
  clearInterval(timerInterval)
})

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const selectOption = (key) => {
  if (showResult.value) return // Prevent multiple clicks
  selectedAnswer.value = key
  showResult.value = true

  if (key === currentQuestion.value.correctAnswer) {
    score.value++
  }

  setTimeout(() => {
    nextQuestion()
  }, 1000)
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    showResult.value = false
  } else {
    endQuiz()
  }
}

const resetSetup = () => {
  hasStarted.value = false
  isFinished.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4 selection:bg-indigo-300">
    <div class="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-indigo-600 p-6 text-white text-center flex justify-between items-center" v-if="hasStarted">
        <h1 class="text-3xl font-bold">Quick Quiz</h1>
        <div class="flex flex-col items-end">
          <p class="text-xl font-mono bg-indigo-800 px-3 py-1 rounded shadow-inner"
            :class="{ 'text-red-400': timeRemaining <= 60, 'animate-pulse': timeRemaining > 0 && timeRemaining <= 60 }">
            {{ formattedTime }}
          </p>
          <p class="text-indigo-200 mt-2 text-sm" v-if="!isFinished && questions.length > 0">
            Q {{ currentQuestionIndex + 1 }} / {{ questions.length }}
          </p>
        </div>
      </div>
      <div v-else class="bg-indigo-600 p-6 text-white text-center">
        <h1 class="text-3xl font-bold">Exam Quiz App</h1>
      </div>

      <!-- Content -->
      <div class="p-8">

        <!-- Setup Screen -->
        <div v-if="!hasStarted" class="text-center py-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Quiz Setup</h2>

          <div class="max-w-xs mx-auto mb-8 text-left">
            <label class="block text-sm font-medium text-gray-700 mb-2">Timer duration (minutes)</label>
            <input type="number" v-model="timerMinutes" min="1" max="180"
              class="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-800 font-semibold transition-colors" />
            <p class="text-xs text-gray-500 mt-2">The quiz will automatically submit when time is up.</p>
          </div>

          <button @click="startQuiz"
            class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none w-full max-w-xs">
            Start Quiz
          </button>
        </div>

        <div v-else-if="!isFinished" class="space-y-6">
          <div class="mb-4">
            <span
              class="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              {{ currentQuestion.topic }}
            </span>
            <h2 class="text-xl font-medium text-gray-800 leading-snug">
              {{ currentQuestion.question }}
            </h2>
          </div>

          <div class="space-y-3">
            <button v-for="(text, key) in currentQuestion.options" :key="key" @click="selectOption(key)"
              :disabled="showResult"
              class="w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
              :class="[
                showResult && key === currentQuestion.correctAnswer
                  ? 'border-green-500 bg-green-50 text-green-900 shadow-sm'
                  : showResult && selectedAnswer === key
                    ? 'border-red-500 bg-red-50 text-red-900 shadow-sm'
                    : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 bg-white shadow-sm hover:shadow'
              ]">
              <div class="flex items-center">
                <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-4 text-sm font-bold"
                  :class="[
                    showResult && key === currentQuestion.correctAnswer
                      ? 'bg-green-200 text-green-800'
                      : showResult && selectedAnswer === key
                        ? 'bg-red-200 text-red-800'
                        : 'bg-indigo-100 text-indigo-700'
                  ]">
                  {{ key }}
                </span>
                <span class="flex-grow">{{ text }}</span>
                <!-- Icons for correct/incorrect -->
                <svg v-if="showResult && key === currentQuestion.correctAnswer"
                  class="w-6 h-6 text-green-500 ml-2 animate-bounce" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <svg v-if="showResult && selectedAnswer === key && key !== currentQuestion.correctAnswer"
                  class="w-6 h-6 text-red-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-full mb-6">
            <svg class="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z">
              </path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p class="text-gray-600 mb-8 text-lg">You scored <span class="font-bold text-indigo-600">{{ score }}</span>
            out of <span class="font-bold">{{ questions.length }}</span></p>

          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button @click="startQuiz"
              class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              Play Again
            </button>
            <button @click="resetSetup"
              class="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full font-semibold transition duration-200 transform hover:scale-105 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-200">
              Change Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
