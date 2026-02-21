<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import {
    Timer,
    ChevronLeft,
    ChevronRight,
    Send,
    XCircle,
    LayoutGrid,
    CheckCircle2
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()

const subjectId = route.params.subjectId

const userName = ref('')
const questions = ref([])
const currentQuestionIndex = ref(0)
const isFinished = ref(false)
const hasStarted = ref(false)

const userAnswers = ref({})

const timerMinutes = ref(15)
const questionCount = ref(5)
const timeRemaining = ref(0)
let timerInterval = null

onMounted(async () => {
    // 1. Get user name and config from storage
    const savedName = localStorage.getItem('quizUserName')
    const savedConfig = localStorage.getItem('quizConfig')

    if (!savedName || !savedConfig) {
        router.push('/')
        return
    }

    userName.value = savedName
    const config = JSON.parse(savedConfig)
    timerMinutes.value = config.timerMinutes || 15
    questionCount.value = config.questionCount || 5

    // 2. Dynamically import questions for the selected subject
    try {
        const subjectData = await import(`../data/${subjectId}.json`)
        const allQuestions = subjectData.default

        startQuizProcess(allQuestions)
    } catch (error) {
        alert(`Could not load quiz data for subject: ${subjectId}`)
        router.push('/subjects')
    }
})

const startQuizProcess = (allQuestions) => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, questionCount.value)

    questions.value = selectedQuestions.map(q => {
        const correctText = q.options[q.correctAnswer]
        const texts = Object.values(q.options).sort(() => Math.random() - 0.5)

        const newOptions = {}
        let newCorrect = ''

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

    const stats = resultStats.value

    const currentResult = {
        date: new Date().toISOString(),
        name: userName.value,
        subject: subjectId,
        score: stats.score,
        missed: stats.missed,
        unattempted: stats.unattempted,
        total: stats.total,
        percentage: Math.round((stats.score / stats.total) * 100),
        questionsConfig: questionCount.value,
        timeSpentSeconds: (timerMinutes.value * 60) - timeRemaining.value,
        answers: userAnswers.value
    }

    // Save to persistence history as always
    let pastResults = []
    const savedResults = localStorage.getItem('quizResults')
    if (savedResults) {
        try {
            pastResults = JSON.parse(savedResults)
        } catch (e) {
            console.error(e)
        }
    }
    pastResults.unshift(currentResult)
    localStorage.setItem('quizResults', JSON.stringify(pastResults))

    // Pass active result to Pinia for the layout
    quizStore.setLatestResult(currentResult, missedQuestions.value, questions.value)

    // Send to Results page
    router.push('/results')
}

onUnmounted(() => {
    clearInterval(timerInterval)
})

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const selectOption = (key) => {
    if (isFinished.value) return
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

const exitQuiz = () => {
    clearInterval(timerInterval)
    router.push('/subjects')
}

const formattedTime = computed(() => {
    const m = Math.floor(timeRemaining.value / 60).toString().padStart(2, '0')
    const s = (timeRemaining.value % 60).toString().padStart(2, '0')
    return `${m}:${s}`
})

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
    <div v-if="!hasStarted" class="p-8 text-center flex-grow flex flex-col justify-center items-center py-12">
        <div class="animate-pulse">
            <div class="h-12 w-12 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p class="mt-4 text-gray-500 font-medium tracking-wide">Loading {{ subjectId }} exam...</p>
    </div>

    <div v-else
        class="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row transition-colors duration-200">
        <!-- Sidebar / Question Tabs (Only visible during quiz) -->
        <div
            class="w-full md:w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 p-4 flex flex-col hidden md:flex transition-colors duration-200">
            <div class="flex justify-between items-center mb-6 px-2">
                <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center">
                    <LayoutGrid class="w-4 h-4 mr-2 text-indigo-500" />
                    Questions
                </h3>
            </div>

            <div
                class="grid grid-cols-5 gap-2 overflow-y-auto max-h-[60vh] md:max-h-none content-start no-scrollbar pr-1">
                <button v-for="(q, index) in questions" :key="q.id" @click="jumpToQuestion(index)"
                    class="w-full aspect-square rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-200"
                    :class="[
                        currentQuestionIndex === index
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1 dark:ring-offset-gray-700 shadow-md transform scale-110 z-10'
                            : userAnswers[q.id]
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 hover:bg-indigo-200'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-500'
                    ]">
                    {{ index + 1 }}
                </button>
            </div>

            <div class="mt-auto pt-6 border-t border-gray-200 dark:border-gray-600 flex flex-col space-y-3">
                <button @click="submitQuiz"
                    class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition duration-200 shadow-sm text-sm flex items-center justify-center">
                    <Send class="w-4 h-4 mr-2" />
                    Submit Early
                </button>
                <button @click="exitQuiz"
                    class="w-full py-2.5 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold transition duration-200 shadow-sm text-sm flex items-center justify-center">
                    <XCircle class="w-4 h-4 mr-2" />
                    Cancel Exam
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-grow flex flex-col w-full h-full min-h-[600px]">
            <!-- Header -->
            <div
                class="bg-indigo-600 dark:bg-indigo-800 p-6 text-white flex justify-between items-center transition-colors duration-200 shadow-md">
                <div>
                    <h1 class="text-2xl font-bold truncate max-w-[200px] md:max-w-xs capitalize flex items-center"
                        :title="subjectId">
                        <span class="bg-white/20 p-2 rounded-lg mr-3">
                            <Timer class="w-6 h-6" />
                        </span>
                        Exam: {{ subjectId }}
                    </h1>
                </div>
                <div class="flex flex-col items-end">
                    <p class="text-xl font-mono bg-indigo-800 dark:bg-indigo-950 px-4 py-1.5 rounded-xl shadow-inner border border-indigo-500/30 flex items-center"
                        :class="{ 'text-red-400 font-bold border-red-500/50 shadow-red-900/40': timeRemaining <= 60, 'animate-pulse': timeRemaining > 0 && timeRemaining <= 60 }">
                        <Timer v-if="timeRemaining <= 60" class="w-5 h-5 mr-2 animate-bounce" />
                        {{ formattedTime }}
                    </p>
                    <p
                        class="text-indigo-200 dark:text-indigo-300 mt-2 text-xs font-bold uppercase tracking-widest md:hidden">
                        Question {{ currentQuestionIndex + 1 }} / {{ questions.length }}
                    </p>
                </div>
            </div>

            <div class="p-6 md:p-8 flex-grow flex flex-col">
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
                        <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">{{ currentQuestion?.topic
                            }}</span>
                    </div>

                    <h2 v-if="currentQuestion"
                        class="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-100 leading-snug mb-8">
                        {{ currentQuestion.question }}
                    </h2>

                    <div v-if="currentQuestion" class="space-y-3">
                        <button v-for="(text, key) in currentQuestion.options" :key="key" @click="selectOption(key)"
                            class="w-full text-left p-4 rounded-xl border-2 transition-all duration-150 relative overflow-hidden group"
                            :class="[
                                userAnswers[currentQuestion.id] === key
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-gray-700'
                            ]">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors"
                                    :class="[
                                        userAnswers[currentQuestion.id] === key
                                            ? 'border-indigo-500 bg-indigo-500 dark:border-indigo-400 dark:bg-indigo-400'
                                            : 'border-gray-300 dark:border-gray-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-500'
                                    ]">
                                    <div v-if="userAnswers[currentQuestion.id] === key"
                                        class="w-2.5 h-2.5 bg-white dark:bg-gray-900 rounded-full"></div>
                                </div>
                                <span class="font-bold mr-3 text-gray-500 dark:text-gray-400"
                                    :class="{ 'text-indigo-700 dark:text-indigo-300': userAnswers[currentQuestion.id] === key }">{{
                                        key }}</span>
                                <span class="flex-grow text-gray-700 dark:text-gray-200"
                                    :class="{ 'text-indigo-900 dark:text-indigo-100 font-medium': userAnswers[currentQuestion.id] === key }">{{
                                        text }}</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Navigation footer -->
                <div class="flex justify-between items-center pt-6 border-t dark:border-gray-700 mt-auto">
                    <button @click="prevQuestion" :disabled="currentQuestionIndex === 0"
                        class="px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center"
                        :class="currentQuestionIndex === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'">
                        <ChevronLeft class="w-5 h-5 mr-2" />
                        Previous
                    </button>

                    <button v-if="currentQuestionIndex < questions.length - 1" @click="nextQuestion"
                        class="px-6 py-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-xl font-bold transition-all duration-200 flex items-center shadow-sm">
                        Next
                        <ChevronRight class="w-5 h-5 ml-2" />
                    </button>

                    <button v-else @click="submitQuiz"
                        class="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-200 shadow-md flex items-center transform hover:-translate-y-0.5">
                        <CheckCircle2 class="w-5 h-5 mr-2" />
                        Submit Quiz
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
