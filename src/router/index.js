import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/subjects",
      name: "subjects",
      component: () => import("../views/SubjectsView.vue"),
    },
    {
      path: "/quiz/:subjectId",
      name: "quiz",
      component: () => import("../views/QuizView.vue"),
    },
    {
      path: "/results",
      name: "results",
      component: () => import("../views/ResultsView.vue"),
    },
    {
      path: "/history",
      name: "history",
      component: () => import("../views/HistoryView.vue"),
    },
  ],
});

export default router;
