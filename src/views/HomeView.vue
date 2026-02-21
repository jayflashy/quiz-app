<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    History,
    ArrowRight,
    Download,
    BookOpenCheck,
    Trophy,
    UserRound
} from 'lucide-vue-next'

const router = useRouter()

const DEFAULT_MINUTES = 15
const DEFAULT_QUESTION_COUNT = 5

const userName = ref('')
const timerMinutes = ref(DEFAULT_MINUTES)
const questionCount = ref(DEFAULT_QUESTION_COUNT)

const pastResults = ref([])

onMounted(() => {
    // Load userName if already set recently
    const savedName = localStorage.getItem('quizUserName')
    if (savedName) userName.value = savedName

    // Load past results
    const savedResults = localStorage.getItem('quizResults')
    if (savedResults) {
        try {
            pastResults.value = JSON.parse(savedResults)
        } catch (e) {
            console.error('Failed to parse past results', e)
        }
    }
})

const proceedToSubjects = () => {
    if (!userName.value.trim()) {
        alert('Please enter your name to start.')
        return
    }

    // Save the user's name to use in the quiz
    localStorage.setItem('quizUserName', userName.value.trim())

    // Save configuration
    const config = {
        timerMinutes: timerMinutes.value,
        questionCount: questionCount.value
    }
    localStorage.setItem('quizConfig', JSON.stringify(config))

    // Go to subjects list
    router.push('/subjects')
}

const goToHistory = () => {
    router.push('/history')
}

// Slice results for home preview
const recentResults = computed(() => pastResults.value.slice(0, 5))

</script>

<template>
    <div class="p-8 text-center flex-grow flex flex-col justify-center items-center py-12 w-full max-w-lg mx-auto">
        <div class="mb-10 w-full flex flex-col items-center">
            <div
                class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-200 dark:border-indigo-800/50 transform rotate-3">
                <BookOpenCheck class="w-10 h-10 text-indigo-600 dark:text-indigo-400 -rotate-3" />
            </div>
            <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Quiz Platform</h1>
            <p class="text-gray-600 dark:text-gray-400 text-lg">Test your knowledge across different subjects!</p>
        </div>

        <div
            class="w-full space-y-6 text-left bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl transition-colors duration-200">

            <div class="relative">
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Student Name</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserRound class="w-5 h-5 text-gray-400" />
                    </div>
                    <input type="text" v-model="userName" placeholder="Enter your full name"
                        class="block w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-800 transition-colors font-medium" />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-2">
                <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time limit
                        (mins)</label>
                    <div class="relative">
                        <input type="number" v-model="timerMinutes"
                            class="block w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white font-semibold transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Questions per
                        test</label>
                    <div class="relative">
                        <input type="number" v-model="questionCount"
                            class="block w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white font-semibold transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200" />
                    </div>
                </div>
            </div>
        </div>

        <button @click="proceedToSubjects"
            class="mt-8 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/30 focus:outline-none w-full flex items-center justify-center">
            Select a Subject
            <ArrowRight class="w-5 h-5 ml-2" />
        </button>

        <!-- Past Results Summary Preview -->
        <div v-if="pastResults.length > 0" class="mt-12 w-full text-left">
            <div class="flex justify-between items-center mb-4">
                <h3
                    class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center">
                    <History class="w-4 h-4 mr-2" />
                    Recent Activity
                </h3>
                <button v-if="pastResults.length > 5" @click="goToHistory"
                    class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors">
                    View All History &rarr;
                </button>
            </div>

            <div
                class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-sm">
                <div v-for="(res, idx) in recentResults" :key="idx"
                    class="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <div class="flex flex-col">
                        <div class="flex items-center">
                            <p class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ res.name }}</p>
                            <span class="mx-2 text-gray-300 dark:text-gray-600">•</span>
                            <span
                                class="text-xs font-semibold px-2 py-0.5 rounded capitalize bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{{
                                res.subject || 'general' }}</span>
                        </div>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                            {{ new Date(res.date).toLocaleDateString() }}
                        </p>
                    </div>

                    <div class="text-right flex items-center">
                        <div class="mr-4 text-right">
                            <p class="text-sm font-black"
                                :class="res.percentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'">
                                {{ res.percentage }}%
                            </p>
                            <p class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                                {{ res.score }}/{{ res.total }} pts</p>
                        </div>
                        <Trophy class="w-5 h-5 hidden sm:block"
                            :class="res.percentage >= 50 ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'" />
                    </div>
                </div>
            </div>

            <button v-if="pastResults.length <= 5" @click="goToHistory"
                class="w-full mt-3 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                Open full History view
            </button>
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
