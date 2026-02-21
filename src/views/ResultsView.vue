<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    RotateCcw,
    ListRestart,
    Download,
    ShieldCheck
} from 'lucide-vue-next'

const router = useRouter()
const quizStore = useQuizStore()

const showReview = ref(false)

onMounted(() => {
    if (!quizStore.latestResult) {
        router.replace('/subjects')
    }
})

const result = computed(() => quizStore.latestResult || {})
const missedQuestions = computed(() => result.value.missedQuestions || [])

const exitResults = () => {
    quizStore.clearResult()
    router.push('/subjects')
}

const retakeQuiz = () => {
    const subject = result.value.subject
    quizStore.clearResult()
    if (subject) {
        router.push(`/quiz/${subject}`)
    } else {
        router.push('/subjects')
    }
}

const downloadResultsJson = () => {
    // We can just download the full array of results here for consistency
    const savedResults = localStorage.getItem('quizResults')
    if (!savedResults) return

    const pastResults = JSON.parse(savedResults)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pastResults, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `quiz_results_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}

</script>

<template>
    <div v-if="result.score !== undefined"
        class="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[90vh] overflow-y-auto no-scrollbar p-8 py-10 transition-colors duration-200">
        <div v-if="!showReview" class="w-full flex-grow flex flex-col justify-center">
            <div class="text-center mb-10">
                <div
                    class="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4 shadow-sm border border-green-200 dark:border-green-800">
                    <ShieldCheck class="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2"><span class="capitalize">{{
                        result.subject }}</span> Exam Completed</h2>
                <p class="text-gray-500 dark:text-gray-400">Candidate: <span
                        class="font-semibold text-gray-700 dark:text-gray-300">{{ result.name }}</span></p>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto w-full">
                <!-- Score -->
                <div
                    class="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center justify-center shadow-sm">
                    <div class="bg-indigo-100 dark:bg-indigo-800/50 p-2 rounded-full mb-3">
                        <CheckCircle class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p class="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
                        Score</p>
                    <p class="text-3xl font-black text-indigo-700 dark:text-indigo-300">{{ result.score }} <span
                            class="text-sm font-medium text-indigo-400 dark:text-indigo-500">/ {{ result.total }}</span>
                    </p>
                </div>

                <!-- Missed -->
                <div
                    class="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl text-center border border-red-100 dark:border-red-800/30 flex flex-col items-center justify-center shadow-sm">
                    <div class="bg-red-100 dark:bg-red-800/50 p-2 rounded-full mb-3">
                        <XCircle class="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <p class="text-xs text-red-500 dark:text-red-400 font-bold uppercase tracking-wider mb-1">Missed</p>
                    <p class="text-3xl font-black text-red-700 dark:text-red-300">{{ result.missed }}</p>
                </div>

                <!-- Unattempted -->
                <div
                    class="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl text-center border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center shadow-sm">
                    <div class="bg-gray-200 dark:bg-gray-600 p-2 rounded-full mb-3">
                        <AlertCircle class="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">
                        Unattempted</p>
                    <p class="text-3xl font-black text-gray-700 dark:text-gray-300">{{ result.unattempted }}</p>
                </div>

                <!-- Percentage -->
                <div
                    class="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl text-center border border-blue-100 dark:border-blue-800/30 flex flex-col items-center justify-center shadow-sm">
                    <div class="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-full mb-3">
                        <BarChart3 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p class="text-xs text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
                        Percentage</p>
                    <p class="text-3xl font-black"
                        :class="result.percentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                        {{ result.percentage }}%
                    </p>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-center items-center gap-4 mt-auto w-full max-w-md mx-auto">
                <button @click="exitResults"
                    class="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition duration-200 shadow-md flex items-center justify-center">
                    <ListRestart class="w-5 h-5 mr-2" />
                    Subjects
                </button>
                <button @click="retakeQuiz"
                    class="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition duration-200 shadow-sm flex items-center justify-center">
                    <RotateCcw class="w-5 h-5 mr-2" />
                    Retake
                </button>
            </div>

            <div v-if="result.missed > 0 || result.unattempted > 0"
                class="mt-8 text-center pt-8 border-t border-gray-100 dark:border-gray-700">
                <button @click="showReview = true"
                    class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold underline decoration-2 underline-offset-4 decoration-indigo-200 dark:decoration-indigo-800/50 transition-colors">
                    Review Missed Questions &rarr;
                </button>
            </div>
            <div class="mt-8 text-center" v-else>
                <button @click="downloadResultsJson"
                    class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium flex items-center justify-center mx-auto transition-colors">
                    <Download class="w-4 h-4 mr-2" />
                    Download Results
                </button>
            </div>
        </div>

        <!-- Review Screen Data -->
        <div v-else class="text-left w-full max-w-2xl mx-auto pb-8">
            <div
                class="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 pt-2">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    Review Missed Questions
                </h2>
                <button @click="showReview = false"
                    class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800/50">
                    Done
                </button>
            </div>

            <div class="space-y-8 mt-6">
                <div v-for="(q) in missedQuestions" :key="q.id"
                    class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 relative shadow-sm">
                    <div
                        class="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-sm border dark:border-gray-600">
                        ID: {{ q.id }}
                    </div>

                    <span
                        class="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                        <XCircle v-if="result.answers[q.id]" class="w-3 h-3 mr-1" />
                        <AlertCircle v-else class="w-3 h-3 mr-1" />
                        {{ result.answers[q.id] ? 'Incorrect' : 'Unattempted' }}
                    </span>

                    <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4 pr-12">{{ q.question }}</h3>

                    <div class="space-y-2">
                        <div v-for="(text, key) in q.options" :key="key"
                            class="p-4 rounded-xl flex items-start text-sm transition-colors border" :class="[
                                key === q.correctAnswer
                                    ? 'bg-green-100/50 dark:bg-green-900/30 text-green-900 dark:text-green-200 border-green-300 dark:border-green-800/50 font-medium shadow-sm'
                                    : result.answers[q.id] === key
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800/50 strike-through'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                            ]">
                            <span class="font-bold mr-3"
                                :class="key === q.correctAnswer ? 'text-green-700 dark:text-green-400' : result.answers[q.id] === key ? 'text-red-700 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
                                {{ key }}
                            </span>
                            <span class="flex-grow">{{ text }}</span>

                            <CheckCircle v-if="key === q.correctAnswer"
                                class="w-5 h-5 text-green-600 dark:text-green-400 ml-2 flex-shrink-0" />
                            <XCircle v-if="result.answers[q.id] === key && key !== q.correctAnswer"
                                class="w-5 h-5 text-red-500 dark:text-red-400 ml-2 flex-shrink-0 opacity-70" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-10 flex justify-center pb-8 border-t border-gray-100 dark:border-gray-700 pt-8">
                <button @click="showReview = false"
                    class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition duration-200 shadow-md">
                    Finish Review
                </button>
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

.strike-through {
    text-decoration: line-through;
    text-decoration-color: rgba(239, 68, 68, 0.5);
    text-decoration-thickness: 2px;
}
</style>
