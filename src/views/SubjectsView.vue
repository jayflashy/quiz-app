<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    TrendingUp,
    Landmark,
    ArrowLeft,
    Lock,
    ArrowRight,
    History,
    Book,
    BookA,
    Palmtree
} from 'lucide-vue-next'

const router = useRouter()
const userName = ref('')

// Define components manually instead of strings so Vue can render them
const subjects = [
    { id: 'economics', name: 'AEC 303', icon: TrendingUp, description: 'Test your knowledge on micro and macro economics.' },
    { id: 'axd301', name: 'AXD 301', icon: Book, description: 'Test your knoledge on AXD 301' },
    { id: 'ans301', name: 'ANS 301', icon: BookA, description: 'Test your knoledge on ANS 301' },
    { id: 'cpp301', name: 'CPP 301', icon: Palmtree, description: 'Test your knoledge on CPP 301' },
    { id: 'cpp303', name: 'CPP 303', icon: Book, description: 'Test your knoledge on CPP 303' },
    { id: 'slm301', name: 'SLM 301', icon: Landmark, description: 'Test your knoledge on SLM 301' },
    { id: 'aec301', name: 'AEC 301', icon: Book, description: 'Test your knoledge on AEC 301' },
]

onMounted(() => {
    const savedName = localStorage.getItem('quizUserName')
    if (savedName) userName.value = savedName
    else router.push('/') // Redirect if no name set
})

const startQuiz = (subjectId) => {
    router.push(`/quiz/${subjectId}`)
}
</script>

<template>
    <div class="p-8 flex-grow flex flex-col justify-center items-center py-12 w-full max-w-6xl mx-auto">

        <div class="w-full flex justify-between mb-8">
            <button @click="router.push('/')"
                class="text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <ArrowLeft class="w-4 h-4 mr-2" />
                Back to Setup
            </button>

            <button @click="router.push('/history')"
                class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                <History class="w-4 h-4 mr-2" />
                View History
            </button>
        </div>

        <div
            class="text-center mb-12 w-full bg-indigo-600 dark:bg-indigo-900/50 rounded-3xl p-10 text-white shadow-lg overflow-hidden relative">
            <div class="absolute top-0 right-0 -mr-10 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <h2 class="text-4xl font-extrabold mb-3 relative z-10">Welcome, <span class="text-yellow-300">{{ userName
            }}</span>!</h2>
            <p class="text-indigo-100 text-lg relative z-10">Choose a subject below to start your exam.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <button v-for="subject in subjects" :key="subject.id" @click="!subject.disabled && startQuiz(subject.id)"
                :disabled="subject.disabled"
                class="text-left bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group shadow flex flex-col items-start h-full"
                :class="[
                    subject.disabled
                        ? 'border-gray-100 dark:border-gray-700 opacity-70 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/50'
                        : 'border-transparent hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 dark:hover:border-indigo-500 cursor-pointer'
                ]">
                <div class="mb-5 bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-inner border border-indigo-100 dark:border-indigo-800/50 group-hover:bg-indigo-600 group-hover:text-white"
                    :class="subject.disabled ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' : 'text-indigo-600 dark:text-indigo-400'">
                    <component :is="subject.icon" class="w-8 h-8" stroke-width="1.5" />
                </div>

                <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{{ subject.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 flex-grow leading-relaxed">{{ subject.description }}
                </p>

                <div
                    class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50 w-full flex items-center justify-between">
                    <span v-if="subject.disabled"
                        class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center">
                        <Lock class="w-3.5 h-3.5 mr-1.5" />
                        Locked Module
                    </span>
                    <span v-else
                        class="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center group-hover:translate-x-1 transition-transform">
                        Start Exam
                        <ArrowRight class="w-4 h-4 ml-1.5" />
                    </span>
                </div>
            </button>
        </div>
    </div>
</template>
