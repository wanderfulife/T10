<!-- ModeSelector.vue -->
<template>
  <div class="form-group">
    <!-- Mode Selection -->
    <div v-if="step === 1">
      <label class="form-label">Mode de transport</label>
      <div class="mode-options">
        <div
          v-for="(value, key) in filteredStationData"
          :key="key"
          @click="selectMode(key)"
          class="mode-option"
        >
          {{ value.name || key }}
        </div>
        <!-- Additional transport modes -->
        <div
          v-for="mode in additionalModes"
          :key="mode"
          @click="selectAdditionalMode(mode)"
          class="mode-option"
        >
          {{ mode }}
        </div>
      </div>
    </div>

    <!-- Bus Line Input (for Bus mode) -->
    <div v-if="step === 2 && selectedMode === 'Bus'">
      <label class="form-label">Ligne de bus</label>
      <input
        class="form-control"
        type="text"
        v-model="busLine"
        placeholder="Nom ou numéro de la ligne"
      />
      <button @click="step = 1" class="btn btn-secondary btn-sm mt-2">
        Retour
      </button>
    </div>

    <!-- Line Selection (for standard modes) -->
    <div v-if="step === 2 && !isAdditionalMode && selectedMode !== 'Bus'">
      <label class="form-label">Ligne</label>
      <div class="line-options">
        <div
          v-for="(value, key) in selectedModeLines"
          :key="key"
          @click="selectLine(key)"
          class="line-option"
        >
          {{ value.name || key }}
        </div>
      </div>
      <button @click="step = 1" class="btn btn-secondary btn-sm mt-2">
        Retour
      </button>
    </div>

    <!-- Departure Station Selection -->
    <div v-if="step === 3">
      <label class="form-label">Station de montée</label>
      <input
        class="form-control"
        type="text"
        v-model="departureSearch"
        @input="filterStations"
        placeholder="Rechercher une station"
      />
      <div v-if="filteredStations.length > 0" class="station-dropdown">
        <div
          v-for="station in filteredStations"
          :key="station.key"
          @click="selectDepartureStation(station)"
          class="station-option"
        >
          {{ station.name }}
        </div>
      </div>
      <button @click="step = 2" class="btn btn-secondary btn-sm mt-2">
        Retour
      </button>
    </div>

    <!-- Arrival Station Selection -->
    <div v-if="step === 4">
      <label class="form-label">Station de descente</label>
      <input
        class="form-control"
        type="text"
        v-model="arrivalSearch"
        @input="filterArrivalStations"
        placeholder="Rechercher une station"
      />
      <div v-if="filteredArrivalStations.length > 0" class="station-dropdown">
        <div
          v-for="station in filteredArrivalStations"
          :key="station.key"
          @click="selectArrivalStation(station)"
          class="station-option"
        >
          {{ station.name }}
        </div>
      </div>
      <button @click="step = 3" class="btn btn-secondary btn-sm mt-2">
        Retour
      </button>
    </div>

    <!-- Selection Summary (for standard modes) -->
    <div v-if="step === 5 && !isAdditionalMode">
      <div class="selection-summary">
        <div class="selection-item">
          <span class="selection-label">Mode:</span> {{ selectedMode }}
        </div>
        <div class="selection-item">
          <span class="selection-label">Ligne:</span> {{ selectedLine }}
        </div>
        <div class="selection-item">
          <span class="selection-label">Station de montée:</span>
          {{ departureStation.name }}
        </div>
        <div class="selection-item">
          <span class="selection-label">Station de descente:</span>
          {{ arrivalStation.name }}
        </div>
        <button @click="step = 4" class="btn btn-secondary btn-sm mt-2">
          Modifier
        </button>
      </div>
    </div>

    <!-- Selection Summary (for Bus mode) -->
    <div v-if="step === 5 && selectedMode === 'Bus'">
      <div class="selection-summary">
        <div class="selection-item">
          <span class="selection-label">Mode:</span> {{ selectedMode }}
        </div>
        <div class="selection-item">
          <span class="selection-label">Ligne de bus:</span> {{ busLine }}
        </div>
        <button @click="step = 2" class="btn btn-secondary btn-sm mt-2">
          Modifier
        </button>
      </div>
    </div>

    <!-- Selection Summary (for additional modes) -->
    <div v-if="step === 2 && isAdditionalMode && selectedMode !== 'Bus'">
      <div class="selection-summary">
        <div class="selection-item">
          <span class="selection-label">Mode:</span> {{ selectedMode }}
        </div>
        <button @click="step = 1" class="btn btn-secondary btn-sm mt-2">
          Modifier
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { stationData } from "./stations.js";

const props = defineProps({
  modelValue: Object,
});

const emit = defineEmits(["update:modelValue"]);

// Define additional modes
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

// Define refs
const selectedMode = ref("");
const selectedLine = ref("");
const departureStation = ref(null);
const arrivalStation = ref(null);
const departureSearch = ref("");
const arrivalSearch = ref("");
const step = ref(1);
const filteredStations = ref([]);
const filteredArrivalStations = ref([]);
const isAdditionalMode = ref(false);
const busLine = ref("");

// Filter out Foreign section from stationData
const filteredStationData = computed(() => {
  const result = {};
  for (const [key, value] of Object.entries(stationData)) {
    if (key !== "Foreign") {
      result[key] = value;
    }
  }
  return result;
});

// Computed properties
const selectedModeLines = computed(() => {
  if (!selectedMode.value || !filteredStationData.value[selectedMode.value])
    return {};
  return filteredStationData.value[selectedMode.value];
});

const selectedLineStations = computed(() => {
  if (
    !selectedMode.value ||
    !selectedLine.value ||
    !filteredStationData.value[selectedMode.value] ||
    !filteredStationData.value[selectedMode.value][selectedLine.value]
  ) {
    return [];
  }
  return (
    filteredStationData.value[selectedMode.value][selectedLine.value]
      .stations || []
  );
});

// Methods
const selectMode = (mode) => {
  selectedMode.value = mode;
  isAdditionalMode.value = false;
  step.value = 2;
  selectedLine.value = "";
  departureStation.value = null;
  arrivalStation.value = null;
};

const selectAdditionalMode = (mode) => {
  selectedMode.value = mode;
  isAdditionalMode.value = true;
  selectedLine.value = "";
  departureStation.value = null;
  arrivalStation.value = null;

  if (mode === "Bus") {
    busLine.value = "";
    step.value = 2;
  } else {
    // For other additional modes, emit immediately and stay at step 2
    step.value = 2;
    emit("update:modelValue", {
      mode: mode,
      line: null,
      departureStation: null,
      arrivalStation: null,
    });
  }
};

const selectBusLine = () => {
  if (busLine.value.trim()) {
    step.value = 5;
    updateModelValue();
  }
};

const selectLine = (line) => {
  selectedLine.value = line;
  step.value = 3;
  filterStations();
};

const filterStations = () => {
  if (selectedLineStations.value.length === 0) {
    filteredStations.value = [];
    return;
  }

  if (!departureSearch.value) {
    filteredStations.value = selectedLineStations.value.slice(0, 15);
    return;
  }

  const search = departureSearch.value.toLowerCase();
  filteredStations.value = selectedLineStations.value
    .filter((station) => station.name.toLowerCase().includes(search))
    .slice(0, 15);
};

const filterArrivalStations = () => {
  if (selectedLineStations.value.length === 0) {
    filteredArrivalStations.value = [];
    return;
  }

  if (!arrivalSearch.value) {
    // Exclude the departure station from arrival options
    filteredArrivalStations.value = selectedLineStations.value
      .filter((station) => station.key !== departureStation.value?.key)
      .slice(0, 15);
    return;
  }

  const search = arrivalSearch.value.toLowerCase();
  filteredArrivalStations.value = selectedLineStations.value
    .filter(
      (station) =>
        station.name.toLowerCase().includes(search) &&
        station.key !== departureStation.value?.key
    )
    .slice(0, 15);
};

const selectDepartureStation = (station) => {
  departureStation.value = station;
  departureSearch.value = station.name;
  step.value = 4;
  arrivalSearch.value = "";
  filterArrivalStations();
};

const selectArrivalStation = (station) => {
  arrivalStation.value = station;
  arrivalSearch.value = station.name;
  step.value = 5;
  updateModelValue();
};

const updateModelValue = () => {
  if (isAdditionalMode.value) {
    if (selectedMode.value === "Bus") {
      emit("update:modelValue", {
        mode: selectedMode.value,
        line: busLine.value,
        departureStation: null,
        arrivalStation: null,
      });
    } else {
      emit("update:modelValue", {
        mode: selectedMode.value,
        line: null,
        departureStation: null,
        arrivalStation: null,
      });
    }
  } else {
    emit("update:modelValue", {
      mode: selectedMode.value,
      line: selectedLine.value,
      departureStation: departureStation.value,
      arrivalStation: arrivalStation.value,
    });
  }
};

// Reset form when modelValue is cleared externally
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      selectedMode.value = "";
      selectedLine.value = "";
      departureStation.value = null;
      arrivalStation.value = null;
      departureSearch.value = "";
      arrivalSearch.value = "";
      busLine.value = "";
      isAdditionalMode.value = false;
      step.value = 1;
    }
  }
);

// Initialize from modelValue if provided
if (props.modelValue) {
  selectedMode.value = props.modelValue.mode || "";

  // Check if it's an additional mode
  if (additionalModes.includes(selectedMode.value)) {
    isAdditionalMode.value = true;

    if (selectedMode.value === "Bus") {
      busLine.value = props.modelValue.line || "";
      if (busLine.value) {
        step.value = 5;
      } else {
        step.value = 2;
      }
    } else {
      step.value = 2;
    }
  } else {
    // Standard mode
    isAdditionalMode.value = false;
    selectedLine.value = props.modelValue.line || "";
    departureStation.value = props.modelValue.departureStation || null;
    arrivalStation.value = props.modelValue.arrivalStation || null;

    if (departureStation.value) {
      departureSearch.value = departureStation.value.name;
    }

    if (arrivalStation.value) {
      arrivalSearch.value = arrivalStation.value.name;
    }

    if (
      selectedMode.value &&
      selectedLine.value &&
      departureStation.value &&
      arrivalStation.value
    ) {
      step.value = 5;
    } else if (
      selectedMode.value &&
      selectedLine.value &&
      departureStation.value
    ) {
      step.value = 4;
    } else if (selectedMode.value && selectedLine.value) {
      step.value = 3;
    } else if (selectedMode.value) {
      step.value = 2;
    }
  }
}

// Modified the bus line input handler to update on change
watch(busLine, (newVal) => {
  if (newVal && newVal.trim() !== "") {
    updateModelValue();
  }
});
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
  background-color: #2a3b63;
  padding: 15px;
  border-radius: 8px;
  color: white;
  width: 100%;
  box-sizing: border-box;
}

.form-label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: white;
}

.form-control {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #4a5a83;
  border-radius: 4px;
  background-color: #333;
  color: white;
  box-sizing: border-box;
}

.mode-options,
.line-options {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #4a5a83;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #354770;
  width: 100%;
  box-sizing: border-box;
}

.mode-option,
.line-option,
.station-option {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #4a5a83;
  color: white;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.mode-option:hover,
.line-option:hover,
.station-option:hover {
  background-color: #4a5a83;
}

.station-dropdown {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #4a5a83;
  border-radius: 4px;
  margin-top: -10px;
  margin-bottom: 10px;
  background-color: #354770;
  width: 100%;
  box-sizing: border-box;
}

.selection-summary {
  background-color: #354770;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  color: white;
}

.selection-item {
  margin-bottom: 5px;
  color: white;
}

.selection-label {
  font-weight: bold;
  margin-right: 5px;
  color: white;
}

button {
  background-color: #4a5a83;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 5px;
}

button:hover {
  background-color: #5b6b94;
}

button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.btn-next {
  background-color: #2ea44f;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  box-sizing: border-box;
}

/* Make sure buttons from bootstrap don't conflict */
.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.mt-2 {
  margin-top: 0.5rem;
}

@media screen and (max-width: 480px) {
  .mode-option,
  .line-option,
  .station-option {
    padding: 10px 8px;
    font-size: 14px;
  }

  .form-group {
    padding: 10px;
  }

  .selection-summary {
    font-size: 14px;
  }
}
</style> 