<template>
  <div>
    <button class="btn-signin" @click="showSignInModal = true">
      Connexion Admin
    </button>

    <!-- Sign In Modal -->
    <div v-if="showSignInModal" class="modal">
      <div class="modal-content signin-modal">
        <button class="close" @click="showSignInModal = false">&times;</button>
        <h2>Connexion Admin</h2>
        <input
          v-model="password"
          type="password"
          placeholder="Entrez le mot de passe"
          class="form-control"
        />
        <button @click="signIn" class="btn-signin">Se connecter</button>
      </div>
    </div>

    <!-- Admin Dashboard Modal -->
    <div v-if="showAdminDashboard" class="modal">
      <div class="modal-content admin-dashboard">
        <button class="close" @click="showAdminDashboard = false">
          &times;
        </button>
        <h2>Tableau de Bord Admin</h2>
        <div class="dashboard-content">
          <div class="dashboard-card total">
            <h3>Total des Enquêtes</h3>
            <p class="big-number">{{ totalSurveys }}</p>
          </div>
          <div class="dashboard-card">
            <h3>Enquêtes par Enquêteur</h3>
            <div class="enqueteur-list">
              <div
                v-for="(data, name) in enqueteurData"
                :key="name"
                class="enqueteur-item"
              >
                <div class="enqueteur-info">
                  <div class="enqueteur-name">{{ name }}</div>
                  <div class="badge-row">
                    <span class="badge-label">Poste:</span>
                    <span class="poste-badge">{{
                      getPosteText(data.poste)
                    }}</span>
                  </div>
                  <div class="badge-row">
                    <span class="badge-label">Sens:</span>
                    <span class="sens-badge">{{ getSensText(data.sens) }}</span>
                  </div>
                  <div class="badge-row">
                    <span class="badge-label">Jour:</span>
                    <span class="jour-badge">{{
                      data.jour || "Non défini"
                    }}</span>
                  </div>
                </div>
                <div class="count-badge">{{ data.count }}</div>
              </div>
            </div>
          </div>
        </div>
        <button @click="downloadData" class="btn-download">
          Télécharger les Données
        </button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
});

const showSignInModal = ref(false);
const showAdminDashboard = ref(false);
const password = ref("");
const totalSurveys = ref(0);
const enqueteurData = ref({});
const surveysByType = ref({});

const surveyCollectionRef = collection(db, "T10");

const signIn = () => {
  // Implement your sign-in logic here
  if (password.value === "admin123") {
    showSignInModal.value = false;
    showAdminDashboard.value = true;
    fetchDashboardData();
  } else {
    alert("Mot de passe incorrect");
  }
};

const fetchDashboardData = async () => {
  const querySnapshot = await getDocs(surveyCollectionRef);
  totalSurveys.value = querySnapshot.size;

  const enqueteurInfo = {};
  const typeCounts = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    // Count by enqueteur and store Poste
    const enqueteur = data.ENQUETEUR || "Unknown";
    const poste = data.Poste || null;
    const sens = data.Sens || null;
    const jour = data.JOUR || null;

    if (!enqueteurInfo[enqueteur]) {
      enqueteurInfo[enqueteur] = {
        count: 0,
        poste: poste,
        sens: sens,
        jour: jour,
      };
    }
    enqueteurInfo[enqueteur].count += 1;
    // Keep the poste value if it exists
    if (poste && !enqueteurInfo[enqueteur].poste) {
      enqueteurInfo[enqueteur].poste = poste;
    }
    // Keep the sens value if it exists
    if (sens && !enqueteurInfo[enqueteur].sens) {
      enqueteurInfo[enqueteur].sens = sens;
    }
    // Keep the day value if it exists
    if (jour && !enqueteurInfo[enqueteur].jour) {
      enqueteurInfo[enqueteur].jour = jour;
    }

    // Count by type (assuming Q1 represents the type)
    const type = data.Q1 || "Unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  enqueteurData.value = enqueteurInfo;
  surveysByType.value = typeCounts;
};

// Function to get the poste text based on poste ID
const getPosteText = (posteId) => {
  if (!posteId) return "(Non défini)";

  // Find the poste question
  const posteQuestion = props.questions.find((q) => q.id === "Poste");
  if (!posteQuestion || !posteQuestion.options) return `Poste ${posteId}`;

  // Find the matching option text
  const option = posteQuestion.options.find((opt) => opt.id === posteId);
  return option ? option.text : `Poste ${posteId}`;
};

// Function to get the sens text based on sens ID
const getSensText = (sensId) => {
  if (!sensId) return "(Sens non défini)";

  // Find the sens question
  const sensQuestion = props.questions.find((q) => q.id === "Sens");
  if (!sensQuestion || !sensQuestion.options) return `Sens ${sensId}`;

  // Find the matching option text
  const option = sensQuestion.options.find((opt) => opt.id === sensId);
  return option ? option.text : `Sens ${sensId}`;
};

const downloadData = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);

    const headerOrder = [
      "ID_questionnaire",
      "ENQUETEUR",
      "DATE",
      "JOUR",
      "HEURE_DEBUT",
      "HEURE_FIN",
    ];

    // Process questions to create all needed headers
    props.questions.forEach((question) => {
      if (question.usesCommuneSelector) {
        headerOrder.push(
          `${question.id}_COMMUNE`,
          `${question.id}_CODE_INSEE`,
          `${question.id}_COMMUNE_LIBRE`
        );
      } else if (question.usesModeSelector) {
        headerOrder.push(
          `${question.id}_MODE`,
          `${question.id}_LINE`,
          `${question.id}_DEPARTURE_STATION`,
          `${question.id}_DEPARTURE_STATION_ID`,
          `${question.id}_ARRIVAL_STATION`,
          `${question.id}_ARRIVAL_STATION_ID`
        );
      } else {
        headerOrder.push(question.id);
      }
    });

    const data = querySnapshot.docs.map((doc) => {
      const docData = doc.data();
      // Log each document to check for HEURE_DEBUT
      console.log("Processing document", docData.ID_questionnaire);
      console.log("HEURE_DEBUT value:", docData.HEURE_DEBUT);

      return headerOrder.reduce((acc, key) => {
        acc[key] = docData[key] !== undefined ? docData[key] : "";
        return acc;
      }, {});
    });

    console.log("Excel data prepared:", data.length, "rows");
    // Log the first few records to check HEURE_DEBUT
    data.slice(0, 3).forEach((record, index) => {
      console.log(`Record ${index} HEURE_DEBUT:`, record.HEURE_DEBUT);
    });

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headerOrder });

    // Set column widths
    const colWidths = headerOrder.map(() => ({ wch: 20 }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Data");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    XLSX.writeFile(workbook, `T10_Survey_Data_${timestamp}.xlsx`);

    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading data:", error);
  }
};
</script>

<style scoped>
.btn-signin {
  background-color: #4a69bd;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 20px;
  transition: opacity 0.3s;
}

.btn-signin:hover {
  opacity: 0.9;
}

.btn-download {
  background-color: #4a69bd;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  margin-top: 20px;
  transition: opacity 0.3s;
}

.btn-download:hover {
  opacity: 0.9;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #2a3b63;
  color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
}

.close {
  position: absolute;
  right: 20px;
  top: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #ddd;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1010;
}

.close:hover {
  color: white;
}

.dashboard-content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.dashboard-card {
  background-color: #344675;
  border-radius: 10px;
  padding: 20px;
  flex: 1 1 250px;
  min-width: 250px;
  box-sizing: border-box;
}

.dashboard-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #6dbeff;
  text-align: center;
  font-size: 1rem;
  font-weight: normal;
}

.big-number {
  font-size: 2.5em;
  font-weight: bold;
  color: #4fd18b;
  margin: 10px 0;
  text-align: center;
}

.enqueteur-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.enqueteur-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 5px;
}

.enqueteur-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: calc(100% - 40px);
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.badge-label {
  font-size: 0.75rem;
  color: #a0b3d8;
  min-width: 40px;
}

.enqueteur-name {
  font-weight: bold;
  color: white;
  font-size: 0.95rem;
  margin-bottom: 2px;
}

.poste-badge,
.sens-badge,
.jour-badge {
  color: #6dbeff;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count-badge {
  background-color: #4fd18b;
  color: #2a3b63;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: bold;
  align-self: center;
}

.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  box-sizing: border-box;
  font-size: 14px;
}

@media (max-width: 768px) {
  .dashboard-card {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .modal-content {
    padding: 15px;
    width: 95%;
    max-width: 100%;
  }

  .enqueteur-info {
    width: calc(100% - 35px);
  }
}

@media (max-width: 480px) {
  .dashboard-content {
    gap: 10px;
  }

  .dashboard-card {
    padding: 15px;
  }

  .enqueteur-item {
    padding: 12px 10px;
  }

  .badge-row {
    width: 100%;
  }

  .poste-badge,
  .sens-badge,
  .jour-badge {
    max-width: calc(100% - 50px);
  }
}
</style>