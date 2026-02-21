import { defineStore } from "pinia";
import { ref } from "vue";

export const useQuizStore = defineStore("quiz", () => {
  const latestResult = ref(null);

  const setLatestResult = (resultData, missedQuestionsList, questionsList) => {
    latestResult.value = {
      ...resultData,
      missedQuestions: missedQuestionsList,
      allQuestions: questionsList,
    };
  };

  const clearResult = () => {
    latestResult.value = null;
  };

  return { latestResult, setLatestResult, clearResult };
});
