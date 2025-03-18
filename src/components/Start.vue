<template>
  <div class="app-container">
    <!-- Progress Bar -->
    <div v-if="currentStep === 'survey'" class="progress-bar">
      <div class="progress" :style="{ width: `${progress}%` }"></div>
    </div>

    <div class="content-container">
      <!-- Enqueteur Input Step -->
      <div v-if="currentStep === 'enqueteur'">
        <h2>Prénom enqueteur :</h2>
        <input class="form-control" type="text" v-model="enqueteur" />
        <button
          v-if="enqueteur && !isEnqueteurSaved"
          @click="setEnqueteur"
          class="btn-next"
        >
          Suivant
        </button>
      </div>

      <!-- Start Survey Step -->
      <div v-else-if="currentStep === 'start'" class="start-survey-container">
        <h2>
          Bonjour, pour mieux connaître les usages du pôle gare de Dammartin
          Juilly Saint-Mard,<br />
          la communauté d'agglomération<br />
          Roissy Pays de France souhaiterait en savoir plus sur votre
          déplacement en cours.<br />
          Acceptez-vous de répondre à quelques questions ?
        </h2>
        <button @click="startSurvey" class="btn-next">
          COMMENCER QUESTIONNAIRE
        </button>
      </div>

      <!-- Survey Questions Step -->
      <div v-else-if="currentStep === 'survey' && !isSurveyComplete">
        <div class="question-container" v-if="currentQuestion">
          <h2>{{ currentQuestion.text }}</h2>

          <!-- Multiple Choice Question (Q7) -->
          <div
            v-if="currentQuestion?.allowMultiple"
            class="multiple-choice-container"
          >
            <div
              v-for="(option, index) in currentQuestionOptions"
              :key="index"
              class="option-wrapper"
            >
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :value="option.id"
                  v-model="multipleAnswers"
                  class="checkbox-input"
                />
                <span class="option-text">{{ option.text }}</span>
              </label>
            </div>
            <button
              @click="handleMultipleAnswers"
              class="btn-next"
              :disabled="!multipleAnswers.length"
            >
              Suivant
            </button>
          </div>

          <!-- Standard Single Choice Questions -->
          <div
            v-else-if="
              !currentQuestion.freeText && !currentQuestion.usesCommuneSelector
            "
          >
            <div v-for="(option, index) in currentQuestionOptions" :key="index">
              <button
                v-if="!option.hidden"
                @click="selectAnswer(option)"
                class="btn-option"
              >
                {{ option.text }}
              </button>
            </div>
          </div>

          <!-- Commune Selector -->
          <div v-if="currentQuestion.usesCommuneSelector">
            <CommuneSelector
              v-model="communeSelections[currentQuestion.id]"
              v-model:postalCodePrefix="postalCodePrefixes[currentQuestion.id]"
            />
            <p>
              Commune sélectionnée ou saisie:
              {{ communeSelections[currentQuestion.id] }}
            </p>
            <button
              @click="handleCommuneSelection"
              class="btn-next"
              :disabled="!communeSelections[currentQuestion.id]?.trim()"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>

          <!-- Free Text Questions -->
          <div v-if="currentQuestion.freeText">
            <div class="input-container">
              <input
                v-if="currentQuestion.id === 'Q3'"
                v-model="freeTextAnswer"
                class="form-control"
                type="number"
                :placeholder="
                  currentQuestion.freeTextPlaceholder ||
                  'Votre réponse (nombres uniquement)'
                "
              />
              <input
                v-else
                v-model="freeTextAnswer"
                class="form-control"
                type="text"
                :placeholder="
                  currentQuestion.freeTextPlaceholder || 'Votre réponse'
                "
              />
            </div>
            <button
              @click="handleFreeTextAnswer"
              class="btn-next"
              :disabled="!freeTextAnswer"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>

          <!-- Back Button -->
          <button v-if="canGoBack" @click="previousQuestion" class="btn-return">
            Retour
          </button>
        </div>
      </div>

      <!-- Survey Complete Step -->
      <div v-else-if="isSurveyComplete" class="survey-complete">
        <h2>Merci pour votre réponse et bonne journée.</h2>
        <button @click="resetSurvey" class="btn-next">
          Nouveau questionnaire
        </button>
      </div>

      <!-- Logo -->
      <img class="logo" src="../assets/Alycelogo.webp" alt="Logo Alyce" />
    </div>

    <!-- Footer -->
    <div class="footer">
      <AdminDashboard :questions="questions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { questions } from "./surveyQuestions.js";
import CommuneSelector from "./CommuneSelector.vue";
import AdminDashboard from "./AdminDashboard.vue";

// Refs
const persistentQ1 = ref(null);
const docCount = ref(0);
const currentStep = ref("enqueteur");
const startDate = ref("");
const enqueteur = ref("");
const currentQuestionIndex = ref(0);
const answers = ref({});
const freeTextAnswer = ref("");
const questionPath = ref(["Q1"]);
const isEnqueteurSaved = ref(false);
const isSurveyComplete = ref(false);
const stationInput = ref("");
const filteredStations = ref([]);
const multipleAnswers = ref([]);
const communeSelections = ref({});
const postalCodePrefixes = ref({});

// Firestore refs
const surveyCollectionRef = collection(db, "T10");
const counterDocRef = doc(db, "counterT10", "surveyCounter");

const currentQuestion = computed(() => {
  if (
    currentQuestionIndex.value >= 0 &&
    currentQuestionIndex.value < questions.length
  ) {
    const question = questions[currentQuestionIndex.value];

    // Handle dynamic text
    const text =
      typeof question.text === "function"
        ? question.text(answers.value)
        : question.text;

    // Handle dynamic options
    const options =
      typeof question.options === "function"
        ? question.options(answers.value)
        : question.options;

    // Debug logging for all questions
    console.log(
      `Question ${question.id} detected. Current answers:`,
      answers.value
    );
    console.log(`${question.id} text after evaluation:`, text);
    console.log(`${question.id} options after evaluation:`, options);

    return {
      ...question,
      text,
      options,
    };
  }
  return null;
});

// Methods
const handleMultipleAnswers = () => {
  if (currentQuestion.value) {
    let answerString = "";
    currentQuestion.value.options.forEach((option, index) => {
      answerString += `${index + 1}:${
        multipleAnswers.value.includes(option.id) ? 1 : 0
      }`;
      if (index < currentQuestion.value.options.length - 1) {
        answerString += ",";
      }
    });

    // Store the answer string directly
    answers.value[currentQuestion.value.id] = answerString;

    // Check if "Autre" is selected
    if (multipleAnswers.value.includes(6)) {
      nextQuestion("Q7Precision");
    } else {
      nextQuestion("Q8");
    }

    // Clear selections for next time
    multipleAnswers.value = [];

    // Log the stored answer for verification
    console.log("Stored Q7 answer:", answers.value[currentQuestion.value.id]);
  }
};

const currentQuestionOptions = computed(() => {
  if (
    currentQuestion.value &&
    typeof currentQuestion.value.options === "function"
  ) {
    return currentQuestion.value.options(answers.value);
  }
  return currentQuestion.value?.options || [];
});

const showFilteredStations = computed(
  () => stationInput.value.length > 0 && filteredStations.value.length > 0
);

const canGoBack = computed(() => questionPath.value.length > 1);

const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.length - 1
);

const progress = computed(() => {
  if (currentStep.value !== "survey") return 0;
  if (isSurveyComplete.value) return 100;
  const totalQuestions = questions.length;
  const currentQuestionNumber = currentQuestionIndex.value + 1;
  const isLastOrEnding =
    isLastQuestion.value ||
    currentQuestion.value?.options?.some((option) => option.next === "end");
  return isLastOrEnding
    ? 100
    : Math.min(Math.round((currentQuestionNumber / totalQuestions) * 100), 99);
});

// Methods
const setEnqueteur = () => {
  if (enqueteur.value.trim() !== "") {
    currentStep.value = "start";
    currentQuestionIndex.value = persistentQ1.value ? 1 : 0;
    isEnqueteurSaved.value = true;
  }
};

const startSurvey = () => {
  startDate.value = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentStep.value = "survey";
  currentQuestionIndex.value = 0; // Start from Q2 after the start message
  isSurveyComplete.value = false;
};

// Add this near the top of the <script setup> section
const logAnswers = () => {
  console.log("Current answers:", JSON.parse(JSON.stringify(answers.value)));
};

const selectAnswer = (option) => {
  if (currentQuestion.value) {
    answers.value[currentQuestion.value.id] = option.id;

    if (option.next === "end") {
      finishSurvey();
    } else {
      nextQuestion(option.next);
    }
  }
};

const handleFreeTextAnswer = () => {
  if (currentQuestion.value) {
    answers.value[currentQuestion.value.id] = freeTextAnswer.value;
    if (currentQuestion.value.next === "end") {
      finishSurvey();
    } else {
      nextQuestion();
    }
    freeTextAnswer.value = ""; // Reset the free text answer
  }
};

const handleCommuneSelection = () => {
  if (currentQuestion.value.usesCommuneSelector) {
    const questionId = currentQuestion.value.id;
    const selectedValue = communeSelections.value[questionId];

    if (selectedValue && selectedValue.trim() !== "") {
      const parts = selectedValue.split(" - ");

      if (parts.length === 2) {
        // A commune was selected from the list
        const [commune, codeInsee] = parts;
        answers.value[`${questionId}_COMMUNE`] = commune;
        answers.value[`${questionId}_CODE_INSEE`] = codeInsee;
        answers.value[`${questionId}_COMMUNE_LIBRE`] = "";
      } else {
        // Free input was used
        answers.value[`${questionId}_COMMUNE`] = "";
        answers.value[`${questionId}_CODE_INSEE`] = "";
        answers.value[`${questionId}_COMMUNE_LIBRE`] = selectedValue.trim();
      }

      nextQuestion();
      communeSelections.value[questionId] = "";
    }
  }
};

const nextQuestion = (forcedNextId = null) => {
  let nextQuestionId = forcedNextId;
  if (!nextQuestionId && currentQuestion.value) {
    if (typeof currentQuestion.value.next === "function") {
      nextQuestionId = currentQuestion.value.next(answers.value);
    } else {
      nextQuestionId = currentQuestion.value.next;
    }
  }

  if (nextQuestionId === "end") {
    finishSurvey();
  } else if (nextQuestionId) {
    const nextIndex = questions.findIndex((q) => q.id === nextQuestionId);
    if (nextIndex !== -1) {
      currentQuestionIndex.value = nextIndex;
      questionPath.value.push(nextQuestionId);
      freeTextAnswer.value = "";

      // Execute onEnter function if it exists
      const nextQuestion = questions[nextIndex];
      if (typeof nextQuestion.onEnter === "function") {
        nextQuestion.onEnter(answers.value);
      }
    }
  }
};

const previousQuestion = () => {
  if (canGoBack.value) {
    questionPath.value.pop();
    const previousQuestionId =
      questionPath.value[questionPath.value.length - 1];
    const previousIndex = questions.findIndex(
      (q) => q.id === previousQuestionId
    );
    if (previousIndex !== -1) {
      currentQuestionIndex.value = previousIndex;
      delete answers.value[questions[currentQuestionIndex.value].id];
      freeTextAnswer.value = "";
    }
  }
};
// Update the finishSurvey function
const finishSurvey = async () => {
  isSurveyComplete.value = true;
  const now = new Date();
  logAnswers(); // Log all answers before saving to Firebase

  const uniqueId = await getNextId();

  let surveyData = {
    ID_questionnaire: uniqueId,
    HEURE_DEBUT: startDate.value,
    DATE: now.toLocaleDateString("fr-FR").replace(/\//g, "-"),
    JOUR: now.toLocaleDateString("fr-FR", { weekday: "long" }),
    ENQUETEUR: enqueteur.value,
    HEURE_FIN: now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    PORT_ID_ORIGIN: answers.value.PORT_ID_ORIGIN || "",
    PORT_ID_DESTINATION: answers.value.PORT_ID_DESTINATION || "",
  };

  // Include all answers in the survey data
  Object.keys(answers.value).forEach((key) => {
    surveyData[key] = answers.value[key];
  });

  console.log("Survey data to be saved:", surveyData);

  try {
    await addDoc(surveyCollectionRef, surveyData);
    console.log("Survey data saved successfully");
  } catch (error) {
    console.error("Error saving survey data:", error);
  }
};

// Update the resetSurvey function
const resetSurvey = () => {
  currentStep.value = "start";
  startDate.value = "";
  answers.value = { Q1: persistentQ1.value };
  currentQuestionIndex.value = 1; // Start from Q2
  isSurveyComplete.value = false;
};

const getDocCount = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);
    docCount.value = querySnapshot.size;
  } catch (error) {
    console.error("Error getting document count:", error);
  }
};

const getNextId = async () => {
  const counterDoc = await getDoc(counterDocRef);
  let counter = 1;

  if (counterDoc.exists()) {
    counter = counterDoc.data().value + 1;
  }

  await setDoc(counterDocRef, { value: counter });

  return `T10-${counter.toString().padStart(6, "0")}`;
};
</script>


<style>
/* Base styles */
body {
  background-color: #2a3b63;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #2a3b63;
  color: white;
}

.start-survey-container {
  justify-content: center;
  align-items: center;
  height: 50vh;
  width: 100%;
  margin-bottom: 5%;
}

.content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5% 0;
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-y: auto;
}

.question-container {
  width: 100%;
  margin-bottom: 30px;
}

.input-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

h2 {
  text-align: center;
  width: 100%;
}

.form-control {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid white;
  background-color: #333;
  color: white;
  font-size: 16px;
  margin-bottom: 15px;
  box-sizing: border-box;
  outline: none;
}

.btn-next,
.btn-return,
.btn-option {
  width: 100%;
  max-width: 400px;
  color: white;
  padding: 15px;
  margin-top: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.btn-next {
  background-color: #2ea44f;  /* This is your app's green color */
  width: 400px;  /* Match width with other elements */
}

.btn-next:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-return {
  background-color: grey;
  width: 400px;  /* Match width with other elements */
  margin-top: 15px;  /* Adjust spacing */
}

.btn-option {
  background-color: #4a5a83;
  text-align: left;
}

.logo {
  max-width: 25%;
  height: auto;
  margin-top: 40px;
  margin-bottom: 20px;
}

.footer {
  background: linear-gradient(to right, #4c4faf, #3f51b5);
  padding: 20px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

/* Progress bar */
.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease-in-out;
}

/* Multiple choice container styles */
.multiple-choice-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

/* Add these rules here */
.multiple-choice-container .btn-next {
  background-color: #4caf50;
  width: 400px;
  margin: 15px auto;
}

.multiple-choice-container .btn-return {
  width: 400px;
  margin: 15px auto;
}

.option-wrapper {
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  background-color: #4a5a83;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.checkbox-label:hover {
  background-color: #5b6b94;
}

.checkbox-input {
  margin-right: 15px;
  margin-top: 3px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.option-text {
  color: white;
  flex: 1;
  line-height: 1.4;
}

/* Commune selector */
.commune-dropdown {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
}

.commune-option {
  padding: 5px;
  cursor: pointer;
}

.commune-option:hover {
  background-color: #f0f0f0;
}

/* Responsive styles */
@media screen and (max-width: 768px) {
  .question-container {
    margin-bottom: 20px;
  }

  .btn-return {
    margin-top: 20px;
  }

  .logo {
    margin-top: 30px;
  }
}

@media screen and (max-width: 480px) {
  .form-control {
    max-width: 100%;
  }
}
</style>