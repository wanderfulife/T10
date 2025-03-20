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
            <ul>
              <li v-for="(data, name) in enqueteurData" :key="name">
                <span>{{ name }} - {{ getPosteText(data.poste) }}</span>
                <span class="count">{{ data.count }}</span>
              </li>
            </ul>
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

    if (!enqueteurInfo[enqueteur]) {
      enqueteurInfo[enqueteur] = { count: 0, poste: poste };
    }
    enqueteurInfo[enqueteur].count += 1;
    // Keep the poste value if it exists
    if (poste && !enqueteurInfo[enqueteur].poste) {
      enqueteurInfo[enqueteur].poste = poste;
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
  if (!posteId) return "(Poste non défini)";

  // Find the poste question
  const posteQuestion = props.questions.find((q) => q.id === "Poste");
  if (!posteQuestion || !posteQuestion.options) return `Poste ${posteId}`;

  // Find the matching option text
  const option = posteQuestion.options.find((opt) => opt.id === posteId);
  return option ? option.text : `Poste ${posteId}`;
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
      return headerOrder.reduce((acc, key) => {
        acc[key] = docData[key] !== undefined ? docData[key] : "";
        return acc;
      }, {});
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
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 30px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.btn-signin:hover {
  background-color: #45a049;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

/* Keep the rest of the styles unchanged */
.btn-download {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 20px;
}

.btn-download:hover {
  background-color: #2980b9;
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
  background-color: #2c3e50;
  color: #ecf0f1;
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
  position: fixed;
  /* Change from absolute to fixed */
  right: 20px;
  top: 20px;
  font-size: 28px;
  font-weight: bold;
  color: #bdc3c7;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1010;
  /* Ensure it's above other content */
}

.close:hover {
  color: #ecf0f1;
}

.dashboard-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-card {
  background-color: #34495e;
  border-radius: 10px;
  padding: 20px;
  flex: 1 1 250px;
  min-width: 250px;
  box-sizing: border-box;
}

.dashboard-card h3 {
  margin-top: 0;
  color: #3498db;
}

.dashboard-card ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dashboard-card li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.big-number {
  font-size: 3em;
  font-weight: bold;
  color: #2ecc71;
  margin: 10px 0;
}

.count {
  font-weight: bold;
  color: #2ecc71;
}

.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #7f8c8d;
  background-color: #2c3e50;
  color: #ecf0f1;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .dashboard-card {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .btn-signin,
  .btn-download {
    padding: 10px 15px;
    font-size: 14px;
  }

  .modal-content {
    padding: 15px;
    width: 95%;
  }
}

@media (max-width: 480px) {
  .close {
    right: 10px;
    top: 10px;
    font-size: 24px;
  }

  .dashboard-content {
    gap: 10px;
  }

  .dashboard-card {
    padding: 15px;
  }
}
</style>