<script setup>
import { ref, computed, onUnmounted, onMounted, watch } from 'vue'
import allQuestions from './data/questions.json'

// Configuration constants (easy to change from code)
const DEFAULT_MINUTES = 15
const DEFAULT_QUESTION_COUNT = 5

const userName = ref('')
const questions = ref([])
const currentQuestionIndex = ref(0)
const isFinished = ref(false)
const hasStarted = ref(false)
const showReview = ref(false) // Toggle for viewing missed questions

// Dark Mode state
const isDarkMode = ref(false)

// We'll store the user's selected answers in an object { questionId: selectedOptionKey }
const userAnswers = ref({})

// Store history of results
const pastResults = ref([])

const timerMinutes = ref(DEFAULT_MINUTES)
const questionCount = ref(DEFAULT_QUESTION_COUNT)
const timeRemaining = ref(0)
let timerInterval = null

// Load settings and past results on mount
onMounted(() => {
  const savedTheme = localStorage.getItem('quizTheme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  const savedResults = localStorage.getItem('quizResults')
  if (savedResults) {
    try {
      pastResults.value = JSON.parse(savedResults)
    } catch (e) {
      console.error('Failed to parse past results', e)
    }
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

const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60).toString().padStart(2, '0')
  const s = (timeRemaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const startQuiz = () => {
  if (!userName.value.trim()) {
    alert('Please enter your name to start the quiz.')
    return
  }

  // Shuffle all questions and pick the configured amount
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  const selectedQuestions = shuffled.slice(0, questionCount.value)

  questions.value = selectedQuestions.map(q => {
    // Determine the exact text of the correct answer before shuffling
    const correctText = q.options[q.correctAnswer]

    // Shuffle the text values of the options
    const texts = Object.values(q.options).sort(() => Math.random() - 0.5)

    const newOptions = {}
    let newCorrect = ''

    // Re-assign the shuffled texts back to the original keys ('A', 'B', 'C', 'D')
    const keys = Object.keys(q.options)
    keys.forEach((key, index) => {
      newOptions[key] = texts[index]
      if (texts[index] === correctText) {
        newCorrect = key
      }
    })

    return {
      ...q,
      options: newOptions,
      correctAnswer: newCorrect
    }
  })

  currentQuestionIndex.value = 0
  userAnswers.value = {}
  isFinished.value = false
  hasStarted.value = true
  showReview.value = false

  timeRemaining.value = timerMinutes.value * 60
  clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      submitQuiz()
    }
  }, 1000)
}

const submitQuiz = () => {
  isFinished.value = true
  clearInterval(timerInterval)

  // Save the result
  const currentResult = {
    date: new Date().toISOString(),
    name: userName.value,
    score: resultStats.value.score,
    missed: resultStats.value.missed,
    unattempted: resultStats.value.unattempted,
    total: resultStats.value.total,
    percentage: Math.round((resultStats.value.score / resultStats.value.total) * 100),
    questionsConfig: questionCount.value,
    timeSpentSeconds: (timerMinutes.value * 60) - timeRemaining.value,
    answers: userAnswers.value // Keep a record of the actual answers given
  }

  // Add to beginning of array
  pastResults.value.unshift(currentResult)
  localStorage.setItem('quizResults', JSON.stringify(pastResults.value))
}

const downloadResultsJson = () => {
  if (pastResults.value.length === 0) return

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pastResults.value, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", `quiz_results_${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

onUnmounted(() => {
  clearInterval(timerInterval)
})

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const selectOption = (key) => {
  if (isFinished.value) return
  // Just record the answer, don't auto-advance or show correctness yet
  userAnswers.value[currentQuestion.value.id] = key
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const jumpToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const resetSetup = () => {
  hasStarted.value = false
  isFinished.value = false
  showReview.value = false
  userName.value = ''
}

// Calculate results
const resultStats = computed(() => {
  let score = 0
  let missed = 0
  let unattempted = 0

  questions.value.forEach(q => {
    const answered = userAnswers.value[q.id]
    if (!answered) {
      unattempted++
    } else if (answered === q.correctAnswer) {
      score++
    } else {
      missed++
    }
  })

  return { score, missed, unattempted, total: questions.value.length }
})

const missedQuestions = computed(() => {
  return questions.value.filter(q => userAnswers.value[q.id] !== q.correctAnswer)
})

</script>

<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center p-4 selection:bg-indigo-300">
    <!-- Theme Toggle Floating Button -->
    <button @click="toggleTheme"
      class="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-800 dark:text-yellow-400 hover:scale-110 transition-transform">
      <svg v-if="!isDarkMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
        </path>
      </svg>
    </button>

    <div
      class="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row transition-colors duration-200">

      <!-- Sidebar / Question Tabs (Only visible during quiz) -->
      <div v-if="hasStarted && !isFinished"
        class="w-full md:w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 p-4 flex flex-col hidden md:flex transition-colors duration-200">
        <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-4 px-2">Questions</h3>
        <div class="grid grid-cols-5 gap-2 overflow-y-auto max-h-[60vh] md:max-h-none content-start no-scrollbar pr-1">
          <button v-for="(q, index) in questions" :key="q.id" @click="jumpToQuestion(index)"
            class="w-full aspect-square rounded-full text-xs font-medium flex items-center justify-center transition-colors"
            :class="[
              currentQuestionIndex === index
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1 dark:ring-offset-gray-700'
                : userAnswers[q.id]
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]">
            {{ index + 1 }}
          </button>
        </div>

        <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
          <button @click="submitQuiz"
            class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition duration-200 shadow-sm text-sm">
            Submit Early
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-grow flex flex-col w-full">
        <!-- Header -->
        <div
          class="bg-indigo-600 dark:bg-indigo-800 p-6 text-white flex justify-between items-center transition-colors duration-200"
          v-if="hasStarted">
          <div>
            <h1 class="text-2xl font-bold truncate max-w-[200px] md:max-w-xs" :title="userName">Student: {{ userName }}
            </h1>
          </div>
          <div class="flex flex-col items-end">
            <p class="text-xl font-mono bg-indigo-800 dark:bg-indigo-950 px-3 py-1 rounded shadow-inner"
              :class="{ 'text-red-400 font-bold': timeRemaining <= 60, 'animate-pulse': timeRemaining > 0 && timeRemaining <= 60 }">
              {{ formattedTime }}
            </p>
            <p class="text-indigo-200 dark:text-indigo-300 mt-2 text-sm md:hidden" v-if="!isFinished">
              Q {{ currentQuestionIndex + 1 }} / {{ questions.length }}
            </p>
          </div>
        </div>
        <div v-else class="bg-indigo-600 dark:bg-indigo-800 p-6 text-white text-center transition-colors duration-200">
          <h1 class="text-3xl font-bold">Exam Quiz App</h1>
        </div>

        <!-- Setup Screen -->
        <div v-if="!hasStarted" class="p-8 text-center flex-grow flex flex-col justify-center items-center py-12">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-8">Exam Setup</h2>

          <div
            class="w-full max-w-sm space-y-5 text-left bg-white dark:bg-gray-700 p-6 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm transition-colors duration-200">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
              <input type="text" v-model="userName" placeholder="Enter full name"
                class="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-800 transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time (mins)</label>
                <input type="number" v-model="timerMinutes" readonly
                  class="block w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-600 border-2 border-transparent text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed transition-colors" />
                <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Read-only</p>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Questions</label>
                <input type="number" v-model="questionCount" readonly
                  class="block w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-600 border-2 border-transparent text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed transition-colors" />
                <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Read-only</p>
              </div>
            </div>
          </div>

          <button @click="startQuiz"
            class="mt-8 px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg transition duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none w-full max-w-sm">
            Start Exam
          </button>

          <!-- Past Results Summary -->
          <div v-if="pastResults.length > 0" class="mt-8 w-full max-w-sm text-left">
            <div class="flex justify-between items-end mb-2">
              <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent History</h3>
              <button @click="downloadResultsJson"
                class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export JSON
              </button>
            </div>
            <div
              class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-600 max-h-40 overflow-y-auto no-scrollbar">
              <div v-for="(res, idx) in pastResults" :key="idx"
                class="p-3 flex justify-between items-center bg-white dark:bg-gray-800">
                <div>
                  <p class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ res.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ new Date(res.date).toLocaleDateString() }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold"
                    :class="res.percentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{ res.percentage }}%</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ res.score }}/{{ res.total }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quiz Question Screen -->
        <div v-else-if="!isFinished" class="p-6 md:p-8 flex-grow flex flex-col">
          <!-- Mobile tab navigator -->
          <div class="flex overflow-x-auto pb-3 mb-4 space-x-2 md:hidden no-scrollbar">
            <button v-for="(q, index) in questions" :key="'mob-' + q.id" @click="jumpToQuestion(index)"
              class="flex-shrink-0 w-10 h-10 rounded-full text-sm font-medium flex items-center justify-center transition-colors"
              :class="[
                currentQuestionIndex === index
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1 dark:ring-offset-gray-800'
                  : userAnswers[q.id]
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-500 dark:text-gray-300'
              ]">
              {{ index + 1 }}
            </button>
          </div>

          <div class="mb-6 flex-grow">
            <div class="flex items-center justify-between mb-3">
              <span
                class="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-semibold uppercase tracking-wider">
                Question {{ currentQuestionIndex + 1 }}
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">{{ currentQuestion.topic }}</span>
            </div>

            <h2 class="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-100 leading-snug mb-8">
              {{ currentQuestion.question }}
            </h2>

            <div class="space-y-3">
              <button v-for="(text, key) in currentQuestion.options" :key="key" @click="selectOption(key)"
                class="w-full text-left p-4 rounded-xl border-2 transition-all duration-150 relative overflow-hidden group"
                :class="[
                  userAnswers[currentQuestion.id] === key
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-gray-700'
                ]">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors"
                    :class="[
                      userAnswers[currentQuestion.id] === key
                        ? 'border-indigo-500 bg-indigo-500 dark:border-indigo-400 dark:bg-indigo-400'
                        : 'border-gray-300 dark:border-gray-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-500'
                    ]">
                    <div v-if="userAnswers[currentQuestion.id] === key"
                      class="w-2.5 h-2.5 bg-white dark:bg-gray-900 rounded-full"></div>
                  </div>
                  <span class="font-bold mr-3 text-gray-500 dark:text-gray-400"
                    :class="{ 'text-indigo-700 dark:text-indigo-300': userAnswers[currentQuestion.id] === key }">{{ key
                    }}</span>
                  <span class="flex-grow text-gray-700 dark:text-gray-200"
                    :class="{ 'text-indigo-900 dark:text-indigo-100 font-medium': userAnswers[currentQuestion.id] === key }">{{
                      text
                    }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Navigation footer -->
          <div class="flex justify-between items-center pt-4 border-t dark:border-gray-700 mt-auto">
            <button @click="prevQuestion" :disabled="currentQuestionIndex === 0"
              class="px-5 py-2.5 rounded-lg font-medium transition-colors"
              :class="currentQuestionIndex === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700'">
              ← Previous
            </button>

            <button v-if="currentQuestionIndex < questions.length - 1" @click="nextQuestion"
              class="px-6 py-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-lg font-medium transition-colors">
              Next →
            </button>

            <button v-else @click="submitQuiz"
              class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors shadow-sm">
              Submit Quiz
            </button>
          </div>
        </div>

        <!-- Result Screen -->
        <div v-else class="p-8 py-10 flex-grow flex flex-col h-full overflow-y-auto no-scrollbar">

          <div v-if="!showReview">
            <div class="text-center mb-10">
              <div
                class="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-1">Exam Completed</h2>
              <p class="text-gray-500 dark:text-gray-400">Candidate: <span
                  class="font-semibold text-gray-700 dark:text-gray-300">{{ userName }}</span></p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
              <div
                class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center border border-indigo-100 dark:border-indigo-800/30">
                <p class="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Score
                </p>
                <p class="text-3xl font-black text-indigo-700 dark:text-indigo-300">{{ resultStats.score }}</p>
              </div>
              <div
                class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center border border-red-100 dark:border-red-800/30">
                <p class="text-xs text-red-500 dark:text-red-400 font-bold uppercase tracking-wider mb-1">Missed</p>
                <p class="text-3xl font-black text-red-700 dark:text-red-300">{{ resultStats.missed }}</p>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-center border border-gray-200 dark:border-gray-600">
                <p class="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Unattempted
                </p>
                <p class="text-3xl font-black text-gray-700 dark:text-gray-300">{{ resultStats.unattempted }}</p>
              </div>
              <div
                class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800/30">
                <p class="text-xs text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Percentage
                </p>
                <p class="text-3xl font-black"
                  :class="Math.round((resultStats.score / resultStats.total) * 100) >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ Math.round((resultStats.score / resultStats.total) * 100) }}%
                </p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <button @click="resetSetup"
                class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition duration-200 shadow-md">
                Take Another
              </button>
              <button @click="showReview = true" v-if="resultStats.missed > 0 || resultStats.unattempted > 0"
                class="px-8 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full font-semibold transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200">
                Review Missed Questions
              </button>
            </div>
          </div>

          <!-- Review Screen -->
          <div v-else class="text-left w-full max-w-2xl mx-auto pb-8">
            <div class="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Review Missed Questions</h2>
              <button @click="showReview = false"
                class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
                Back to Results
              </button>
            </div>

            <div class="space-y-8">
              <div v-for="(q, index) in missedQuestions" :key="q.id"
                class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                <div
                  class="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-sm border dark:border-gray-600">
                  ID: {{ q.id }}
                </div>

                <span
                  class="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                  {{ userAnswers[q.id] ? 'Incorrect' : 'Unattempted' }}
                </span>

                <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4 pr-12">{{ q.question }}</h3>

                <div class="space-y-2">
                  <div v-for="(text, key) in q.options" :key="key" class="p-3 rounded-lg flex items-start text-sm"
                    :class="[
                      key === q.correctAnswer
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200 border border-green-200 dark:border-green-800/50 font-medium'
                        : userAnswers[q.id] === key
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800/50 strike-through'
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    ]">
                    <span class="font-bold mr-3"
                      :class="key === q.correctAnswer ? 'text-green-700 dark:text-green-400' : userAnswers[q.id] === key ? 'text-red-700 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
                      {{ key }}
                    </span>
                    <span class="flex-grow">{{ text }}</span>

                    <svg v-if="key === q.correctAnswer"
                      class="w-5 h-5 text-green-600 dark:text-green-400 ml-2 flex-shrink-0" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <svg v-if="userAnswers[q.id] === key && key !== q.correctAnswer"
                      class="w-5 h-5 text-red-600 dark:text-red-400 ml-2 flex-shrink-0" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                      </path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 flex justify-center pb-4">
              <button @click="showReview = false"
                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition duration-200 shadow-md">
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar for mobile tabs and review screen */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.strike-through {
  text-decoration: line-through;
  text-decoration-color: rgba(239, 68, 68, 0.5);
  /* red-500 with opacity */
  text-decoration-thickness: 2px;
}
</style>
