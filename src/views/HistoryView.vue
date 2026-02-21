<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    CalendarDays,
    Target,
    Clock,
    Download,
    Trash2,
    ArrowLeft,
    Search,
    BookOpen
} from 'lucide-vue-next'

const router = useRouter()
const pastResults = ref([])
const searchQuery = ref('')
const filterSubject = ref('all')

onMounted(() => {
    const savedResults = localStorage.getItem('quizResults')
    if (savedResults) {
        try {
            pastResults.value = JSON.parse(savedResults)
        } catch (e) {
            console.error('Failed to parse past results', e)
        }
    }
})

const uniqueSubjects = computed(() => {
    const subjects = new Set()
    pastResults.value.forEach(res => {
        if (res.subject) subjects.add(res.subject)
    })
    return Array.from(subjects)
})

const filteredResults = computed(() => {
    return pastResults.value.filter(res => {
        // Subject filter
        if (filterSubject.value !== 'all' && res.subject !== filterSubject.value && !(filterSubject.value === 'general' && !res.subject)) {
            return false
        }

        // Search query
        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase()
            const subjectMatch = (res.subject || 'general').toLowerCase().includes(q)
            const nameMatch = (res.name || '').toLowerCase().includes(q)
            const dateMatch = new Date(res.date).toLocaleDateString().includes(q)
            return subjectMatch || nameMatch || dateMatch
        }

        return true
    })
})

const downloadResultsJson = () => {
    if (pastResults.value.length === 0) return

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pastResults.value, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `quiz_history_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}

const clearHistory = () => {
    if (confirm("Are you sure you want to permanently delete all your quiz history? This cannot be undone.")) {
        localStorage.removeItem('quizResults')
        pastResults.value = []
    }
}

const goHome = () => {
    router.push('/')
}

const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0s'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

// Need to import computed since it wasn't inside the script setup import list initially!
import { computed } from 'vue'
</script>

<template>
    <div class="max-w-4xl w-full flex flex-col h-[90vh] py-6 z-10 transition-colors duration-200">

        <!-- Top Bar -->
        <div class="flex items-center justify-between mb-6 px-2">
            <button @click="goHome"
                class="flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-medium transition-colors">
                <ArrowLeft class="w-5 h-5 mr-1" />
                Back to Setup
            </button>

            <div class="flex items-center space-x-3">
                <button v-if="pastResults.length > 0" @click="downloadResultsJson"
                    class="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm transition-colors text-sm font-semibold">
                    <Download class="w-4 h-4 mr-2" />
                    Export Data
                </button>
                <button v-if="pastResults.length > 0" @click="clearHistory"
                    class="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-600 shadow-sm transition-colors text-sm font-semibold">
                    <Trash2 class="w-4 h-4 mr-2" />
                    Clear Log
                </button>
            </div>
        </div>

        <!-- Main Container -->
        <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-grow w-full border border-gray-100 dark:border-gray-700">

            <!-- Header Area -->
            <div class="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-1">Testing History</h1>
                        <p class="text-gray-500 dark:text-gray-400">Total Exams Taken: <span
                                class="font-bold text-indigo-600 dark:text-indigo-400">{{ pastResults.length }}</span>
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search class="w-4 h-4 text-gray-400" />
                            </div>
                            <input v-model="searchQuery" type="text" placeholder="Search history..."
                                class="pl-10 pr-4 py-2 w-full sm:w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-shadow" />
                        </div>

                        <div class="relative">
                            <select v-model="filterSubject"
                                class="pl-3 pr-8 py-2 w-full sm:w-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white capitalize appearance-none cursor-pointer">
                                <option value="all">All Subjects</option>
                                <option v-for="sub in uniqueSubjects" :key="sub" :value="sub">{{ sub }}</option>
                                <option v-if="pastResults.some(r => !r.subject)" value="general">General (Legacy)
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- History List -->
            <div class="flex-grow overflow-y-auto bg-gray-50/20 dark:bg-gray-900/10 p-4 md:p-6 no-scrollbar">

                <div v-if="pastResults.length === 0"
                    class="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div
                        class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
                        <BookOpen class="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No History Found</h3>
                    <p class="text-gray-500 dark:text-gray-400 max-w-sm mb-6">You haven't completed any exams yet. Start
                        testing your knowledge to build your record!</p>
                    <button @click="router.push('/subjects')"
                        class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-sm">
                        View Subjects
                    </button>
                </div>

                <div v-else-if="filteredResults.length === 0"
                    class="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No results match your current search/filters.</p>
                    <button @click="searchQuery = ''; filterSubject = 'all'"
                        class="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline">Clear filters</button>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="(res, idx) in filteredResults" :key="idx"
                        class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

                        <!-- Side accent bar indicating pass/fail -->
                        <div class="absolute left-0 top-0 bottom-0 w-1.5"
                            :class="res.percentage >= 50 ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'">
                        </div>

                        <div class="pl-3 flex flex-col md:flex-row md:items-center justify-between gap-4">

                            <!-- Core Data -->
                            <div class="flex-grow">
                                <div class="flex items-center gap-2 mb-1">
                                    <span
                                        class="inline-block px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded text-[10px] font-bold uppercase tracking-wider capitalize">
                                        {{ res.subject || 'general' }}
                                    </span>
                                    <span
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                                        <CalendarDays class="w-3 h-3 mr-1" />
                                        {{ new Date(res.date).toLocaleDateString() }} at {{ new
                                            Date(res.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                                    </span>
                                </div>
                                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                    {{ res.name }}
                                </h3>
                            </div>

                            <!-- Metrics -->
                            <div
                                class="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6 bg-gray-50 dark:bg-gray-900/30 p-3 md:p-0 md:bg-transparent md:dark:bg-transparent rounded-lg">
                                <div class="flex items-center">
                                    <div class="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-md mr-2.5">
                                        <Target class="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <p
                                            class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider leading-none mb-0.5">
                                            Score</p>
                                        <p class="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">{{
                                            res.score }} / {{ res.total }}</p>
                                    </div>
                                </div>

                                <div class="flex items-center">
                                    <div class="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-md mr-2.5">
                                        <Clock class="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <p
                                            class="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider leading-none mb-0.5">
                                            Time</p>
                                        <p class="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">{{
                                            formatDuration(res.timeSpentSeconds) }}</p>
                                    </div>
                                </div>

                                <!-- Big Percentage -->
                                <div
                                    class="w-16 text-right md:border-l border-gray-200 dark:border-gray-700 md:pl-6 pl-2 ml-auto">
                                    <p class="text-2xl font-black"
                                        :class="res.percentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                        {{ res.percentage }}%
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
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
