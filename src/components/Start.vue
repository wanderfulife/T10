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
        <h2>Bonjour,</h2>
        <p class="welcome-text">
          Nous réalisons une enquête pour le compte d'Île-de-France Mobilités.
        </p>
        <p class="welcome-text">Pourriez-vous m'accorder quelques instants ?</p>
        <p class="welcome-text">
          Nous vous invitons à répondre à ce questionnaire même si vous avez
          déjà été sollicité.
        </p>
        <p class="welcome-text">Merci.</p>
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

          <!-- Mode Selector -->
          <div v-else-if="currentQuestion.usesModeSelector">
            <ModeSelector v-model="modeSelections[currentQuestion.id]" />
            <div
              v-if="modeSelections[currentQuestion.id]"
              class="selection-summary"
            >
              <div
                v-if="modeSelections[currentQuestion.id].mode"
                class="selection-item"
              >
                <span class="selection-label">Mode:</span>
                {{ modeSelections[currentQuestion.id].mode }}
              </div>
              <div
                v-if="modeSelections[currentQuestion.id].line"
                class="selection-item"
              >
                <span class="selection-label">Ligne:</span>
                {{ modeSelections[currentQuestion.id].line }}
              </div>
              <div
                v-if="modeSelections[currentQuestion.id].departureStation"
                class="selection-item"
              >
                <span class="selection-label">Station de montée:</span>
                {{ modeSelections[currentQuestion.id].departureStation.name }}
              </div>
              <div
                v-if="modeSelections[currentQuestion.id].arrivalStation"
                class="selection-item"
              >
                <span class="selection-label">Station de descente:</span>
                {{ modeSelections[currentQuestion.id].arrivalStation.name }}
              </div>
            </div>
            <button
              @click="handleModeSelection"
              class="btn-next"
              :disabled="!isModeSelectorComplete"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
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
      <div class="logo-container">
        <img class="logo" src="../assets/Alycelogo.webp" alt="Logo Alyce" />
      </div>
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
import ModeSelector from "./ModeSelector.vue";
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
const modeSelections = ref({});

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

// Computed property to check if mode selection is complete
const isModeSelectorComplete = computed(() => {
  if (!currentQuestion.value || !currentQuestion.value.usesModeSelector)
    return false;

  const selection = modeSelections.value[currentQuestion.value.id];
  if (!selection) return false;

  // For additional modes (not in stationData), just having a mode is enough
  const additionalModes = [
    "Bus",
    "Orlyval",
    "Marche",
    "Transport Employeur",
    "Voiture (Conducteur)",
    "2 roues motorisé (moto, scooter)",
    "Autre mode",
    "Train SNCF Grande Ligne / TER",
    "Voiture (Passager)",
    "2 roues non motorisé (vélo)",
  ];

  if (additionalModes.includes(selection.mode)) {
    // For Bus, we need both mode and line
    if (selection.mode === "Bus") {
      return selection.mode && selection.line;
    }
    // For other additional modes, just having the mode is enough
    return selection.mode ? true : false;
  }

  // For standard modes (from stationData), check all fields
  return (
    selection.mode &&
    selection.line &&
    selection.departureStation &&
    selection.arrivalStation
  );
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
  currentQuestionIndex.value = 0; // Start from first question
  isSurveyComplete.value = false;

  // Initialize with empty answers object, don't set Q1 to null
  answers.value = {};
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

    console.log("Commune selection started for question:", questionId);
    console.log("Selected value:", selectedValue);

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

      // Log the stored answers for debugging
      console.log(`Stored commune selection for ${questionId}:`, {
        commune: answers.value[`${questionId}_COMMUNE`],
        codeInsee: answers.value[`${questionId}_CODE_INSEE`],
        communeLibre: answers.value[`${questionId}_COMMUNE_LIBRE`],
      });

      // Log the entire answers object to verify structure
      console.log(
        "Current answers object:",
        JSON.stringify(answers.value, null, 2)
      );

      nextQuestion();
      communeSelections.value[questionId] = "";
    }
  }
};

const handleModeSelection = () => {
  if (currentQuestion.value.usesModeSelector) {
    const questionId = currentQuestion.value.id;
    const selection = modeSelections.value[questionId];

    if (!selection || !selection.mode) return;

    // List of additional modes
    const additionalModes = [
      "Bus",
      "Orlyval",
      "Marche",
      "Transport Employeur",
      "Voiture (Conducteur)",
      "2 roues motorisé (moto, scooter)",
      "Autre mode",
      "Train SNCF Grande Ligne / TER",
      "Voiture (Passager)",
      "2 roues non motorisé (vélo)",
    ];

    // Handle additional modes differently
    if (additionalModes.includes(selection.mode)) {
      // For Bus mode
      if (selection.mode === "Bus") {
        if (selection.line) {
          answers.value[`${questionId}_MODE`] = selection.mode;
          answers.value[`${questionId}_LINE`] = selection.line;
          answers.value[`${questionId}_DEPARTURE_STATION`] = "";
          answers.value[`${questionId}_ARRIVAL_STATION`] = "";

          console.log(`Stored bus selection for ${questionId}:`, {
            mode: selection.mode,
            line: selection.line,
          });

          nextQuestion();
        }
      }
      // For other additional modes
      else {
        answers.value[`${questionId}_MODE`] = selection.mode;
        answers.value[`${questionId}_LINE`] = "";
        answers.value[`${questionId}_DEPARTURE_STATION`] = "";
        answers.value[`${questionId}_ARRIVAL_STATION`] = "";

        console.log(`Stored additional mode selection for ${questionId}:`, {
          mode: selection.mode,
        });

        nextQuestion();
      }
    }
    // Handle standard modes from stationData
    else if (
      selection.mode &&
      selection.line &&
      selection.departureStation &&
      selection.arrivalStation
    ) {
      answers.value[`${questionId}_MODE`] = selection.mode;
      answers.value[`${questionId}_LINE`] = selection.line;
      answers.value[`${questionId}_DEPARTURE_STATION`] =
        selection.departureStation.name;
      answers.value[`${questionId}_DEPARTURE_STATION_ID`] =
        selection.departureStation.id;
      answers.value[`${questionId}_ARRIVAL_STATION`] =
        selection.arrivalStation.name;
      answers.value[`${questionId}_ARRIVAL_STATION_ID`] =
        selection.arrivalStation.id;

      // Log the stored mode selection for debugging
      console.log(`Stored standard mode selection for ${questionId}:`, {
        mode: selection.mode,
        line: selection.line,
        departureStation: selection.departureStation.name,
        arrivalStation: selection.arrivalStation.name,
      });

      nextQuestion();
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
      // Check if the next question is a conditional question
      const nextQ = questions[nextIndex];
      if (nextQ.isConditional && typeof nextQ.condition === "function") {
        // Evaluate the condition and get the appropriate next question ID
        const conditionResult = nextQ.condition();
        nextQuestionId = conditionResult ? nextQ.nextIfTrue : nextQ.nextIfFalse;

        // Find the new index for the actual next question after condition
        const actualNextIndex = questions.findIndex(
          (q) => q.id === nextQuestionId
        );
        if (actualNextIndex !== -1) {
          currentQuestionIndex.value = actualNextIndex;
          questionPath.value.push(nextQuestionId);
        }
      } else {
        // Normal question handling (non-conditional)
        currentQuestionIndex.value = nextIndex;
        questionPath.value.push(nextQuestionId);
      }

      freeTextAnswer.value = "";

      // Execute onEnter function if it exists for the current question
      const activeQuestion = questions[currentQuestionIndex.value];
      if (typeof activeQuestion.onEnter === "function") {
        activeQuestion.onEnter(answers.value);
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

// Simplify the finishSurvey function to just directly save all data
const finishSurvey = async () => {
  isSurveyComplete.value = true;
  const now = new Date();

  // IMPORTANT: Create a deep copy of the answers object immediately
  const answersCopy = JSON.parse(JSON.stringify(answers.value));

  try {
    // Log all answers before saving to Firebase
    console.log(
      "All answers before saving:",
      JSON.stringify(answersCopy, null, 2)
    );

    // Get document ID
    const uniqueId = await getNextId();

    // Create metadata
    const metadata = {
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
    };

    // IMPORTANT: Use our deep copy of answers that cannot be modified
    const dataToSave = { ...metadata, ...answersCopy };

    console.log(
      "Complete data being saved to Firebase:",
      JSON.stringify(dataToSave, null, 2)
    );

    // Check if any answers got lost
    for (const key in answersCopy) {
      if (dataToSave[key] === undefined) {
        console.error(`Key ${key} is missing in dataToSave!`);
      }
    }

    // Save the document to Firebase
    const docRef = await addDoc(surveyCollectionRef, dataToSave);
    console.log("Survey data saved successfully with ID:", docRef.id);

    // Double-check saving by retrieving the document we just saved
    const savedDoc = await getDoc(doc(db, "T10", docRef.id));
    console.log("Saved data retrieved:", savedDoc.exists());
    if (savedDoc.exists()) {
      const savedData = savedDoc.data();
      console.log("Saved data content:", JSON.stringify(savedData, null, 2));

      // Verify all keys were saved
      for (const key in answersCopy) {
        if (savedData[key] === undefined) {
          console.error(`Key ${key} was not saved to Firebase!`);
        }
      }
    }

    // At this point it's safe to clear survey data - the copy has been saved
    // DON'T clear answers here - only in the resetSurvey function
  } catch (error) {
    console.error("Error saving survey data:", error);
    console.error("Error details:", error.message, error.stack);
    alert("Une erreur s'est produite lors de l'enregistrement des données.");
  }
};

// Update the resetSurvey function - this is called AFTER the survey is saved
const resetSurvey = () => {
  console.log("RESETTING SURVEY - clearing answers");

  currentStep.value = "start";
  startDate.value = "";

  // Clear answers ONLY when explicitly resetting the survey - not during save
  answers.value = {};

  currentQuestionIndex.value = 0; // Start from first question
  isSurveyComplete.value = false;
  modeSelections.value = {}; // Clear mode selections
  communeSelections.value = {}; // Clear commune selections
  postalCodePrefixes.value = {}; // Clear postal code prefixes
  questionPath.value = ["Q1"]; // Reset the question path
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

// Add a watch to debug the answers object
watch(
  answers,
  (newAnswers, oldAnswers) => {
    console.log("Answers changed:", JSON.stringify(newAnswers, null, 2));

    // Check if answers are being cleared
    if (
      Object.keys(oldAnswers).length > 0 &&
      Object.keys(newAnswers).length === 0
    ) {
      console.error(
        "ANSWERS WERE CLEARED! Previous stack trace:",
        new Error().stack
      );
    }
  },
  { deep: true }
);
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.start-survey-container h2 {
  margin-bottom: 20px;
}

.welcome-text {
  width: 100%;
  margin: 8px 0;
  text-align: center;
  padding: 0 5px;
  box-sizing: border-box;
  color: white;
  word-wrap: break-word;
}

.content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-y: auto;
}

.question-container {
  width: 100%;
  margin-bottom: 30px;
  padding: 0 10px;
  box-sizing: border-box;
}

.input-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

h2 {
  text-align: center;
  width: 100%;
  word-wrap: break-word;
  font-size: clamp(16px, 5vw, 24px);
  padding: 0 10px;
  box-sizing: border-box;
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
  box-sizing: border-box;
}

.btn-next {
  background-color: #2ea44f; /* This is your app's green color */
  width: 100%;
  max-width: 400px;
}

.btn-next:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-return {
  background-color: grey;
  width: 100%;
  max-width: 400px;
  margin-top: 15px; /* Adjust spacing */
}

.btn-option {
  background-color: #4a5a83;
  text-align: left;
}

.logo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.logo {
  max-width: 160px;
  height: auto;
  margin-top: 20px;
  margin-bottom: 20px;
}

.footer {
  background: linear-gradient(to right, #4c4faf, #3f51b5);
  padding: 15px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
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
  width: 100%;
  max-width: 400px;
  margin: 15px auto;
}

.multiple-choice-container .btn-return {
  width: 100%;
  max-width: 400px;
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
    max-width: 140px;
  }

  .content-container {
    width: 100%;
    padding: 5% 15px;
  }
}

@media screen and (max-width: 480px) {
  .form-control {
    max-width: 100%;
  }

  .multiple-choice-container {
    padding: 0 5px;
  }

  .checkbox-label {
    padding: 12px;
  }

  .logo {
    max-width: 100px;
  }

  .logo-container {
    margin: 10px 0;
  }

  .option-text {
    font-size: 14px;
  }

  .start-survey-container {
    margin-bottom: 10px;
  }

  .content-container {
    padding: 10px;
  }

  .footer {
    padding: 10px;
  }

  .welcome-text {
    margin: 5px 0;
    font-size: 15px;
  }
}
</style>