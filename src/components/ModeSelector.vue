<!-- ModeSelector.vue -->
<template>
  <div class="form-group">
    <!-- Correspondence Banner -->
    <div v-if="props.prefillDepartureStation" class="correspondence-banner">
      <div class="banner-content">
        <span class="banner-icon">↳</span>
        <span class="banner-text">
          Correspondance à
          <strong>{{ props.prefillDepartureStation.name }}</strong>
        </span>
        <span class="banner-subtitle">
          Cette station est fixée comme point de départ, mais peut avoir un nom
          différent selon le mode.
          <br v-if="step === 1" />
          <span v-if="step === 1">Sélectionnez votre mode de transport</span>
          <span v-else-if="step === 2">Sélectionnez votre ligne</span>
          <span v-else-if="step === 3"
            >Sélectionnez votre station de départ</span
          >
          <span v-else-if="step === 4"
            >Sélectionnez votre station d'arrivée</span
          >
        </span>
      </div>
    </div>

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
        v-model="busLineInput"
        placeholder="Nom ou numéro de la ligne"
        @input="updateBusLine"
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
      <label class="form-label">
        Station de montée
        <span v-if="props.prefillDepartureStation" class="connection-label">
          (Correspondance)
        </span>
      </label>

      <!-- Prefill indicator message for correspondence station -->
      <div v-if="props.prefillDepartureStation" class="prefill-indicator">
        <div class="prefill-message">
          <span class="prefill-icon">↳</span>
          Correspondance:
          <strong>{{ props.prefillDepartureStation.name }}</strong>
          (Station de descente du mode précédent)
        </div>
      </div>

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
          :class="{ 'prefilled-station': isPrefilled(station) }"
        >
          {{ station.name }}
          <span v-if="isPrefilled(station)" class="prefill-tag">
            Correspondance
          </span>
        </div>
      </div>
      <button @click="step = 2" class="btn btn-secondary btn-sm mt-2">
        Retour
      </button>
    </div>

    <!-- Arrival Station Selection -->
    <div v-if="step === 4">
      <label class="form-label">
        Station de descente
        <span v-if="departureStation" class="from-label">
          (Depuis {{ departureStation.name }})
        </span>
      </label>

      <!-- Show correspondence info -->
      <div
        v-if="
          props.prefillDepartureStation &&
          props.prefillDepartureStation.name === departureStation?.name
        "
        class="correspondence-notice"
      >
        <div class="notice-content">
          <span class="notice-icon">⟲</span>
          Vous venez d'arriver à
          <strong>{{ departureStation.name }}</strong> par correspondance
        </div>
      </div>

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
          <span v-if="props.prefillDepartureStation" class="correspondence-tag">
            (Correspondance)
          </span>
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
          <span class="selection-label">Ligne de bus:</span> {{ busLineInput }}
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
import { ref, computed, watch, onMounted } from "vue";
import { stationData } from "./stations.js";

// Add a helper function for station name matching with special handling for Chatelet-Les-Halles
const stationMatches = (station1, station2) => {
  if (!station1 || !station2) return false;

  const name1 = station1.name ? station1.name.trim().toUpperCase() : "";
  const name2 = station2.name ? station2.name.trim().toUpperCase() : "";

  // Direct match
  if (name1 === name2) return true;

  // Only special case: Chatelet and Chatelet-Les-Halles
  if (name1 === "CHATELET" && name2 === "CHATELET-LES-HALLES") return true;
  if (name1 === "CHATELET-LES-HALLES" && name2 === "CHATELET") return true;

  return false;
};

const props = defineProps({
  modelValue: Object,
  prefillDepartureStation: Object,
  additionalMode: Boolean,
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
const busLineInput = ref("");

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

// Add missing computed property for availableLines
const availableLines = computed(() => {
  if (!selectedMode.value || !filteredStationData.value[selectedMode.value])
    return [];

  // Get all lines for the selected mode
  const modeData = filteredStationData.value[selectedMode.value];
  return Object.entries(modeData).map(([key, value]) => ({
    name: key,
    ...value,
  }));
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
    busLineInput.value = "";
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
  if (busLineInput.value.trim()) {
    step.value = 5;
    updateModelValue();
  }
};

const selectLine = (line) => {
  console.log(`Selecting line: ${line}`);
  selectedLine.value = line;

  // If we have a correspondence station, check if this line has the station
  if (props.prefillDepartureStation) {
    const stationsForLine = selectedLineStations.value;

    // If no stations, just go to station selection
    if (!stationsForLine || stationsForLine.length === 0) {
      console.log(
        `No stations available for line ${line}, going to manual selection`
      );
      step.value = 3;
      return;
    }

    // Check if the prefilled station exists in this line
    const matchingStation = stationsForLine.find((station) => {
      try {
        return stationMatches(station, props.prefillDepartureStation);
      } catch (e) {
        return station.name === props.prefillDepartureStation.name;
      }
    });

    if (matchingStation) {
      console.log(`Found matching station: ${matchingStation.name}`);
      departureStation.value = matchingStation;
      departureSearch.value = matchingStation.name;

      // Skip to arrival station selection
      step.value = 4;
      filterArrivalStations();

      // Update model
      emit("update:modelValue", {
        mode: selectedMode.value,
        line: selectedLine.value,
        departureStation: departureStation.value,
        arrivalStation: null,
      });
    } else {
      // No matching station, go to departure station selection
      console.log(`No matching station found, going to manual selection`);
      step.value = 3;
      filterStations();
    }
  } else {
    // Normal flow for regular (non-correspondence) mode
    step.value = 3;
    filterStations();
  }
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
        line: busLineInput.value,
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
      busLineInput.value = "";
      isAdditionalMode.value = false;
      step.value = 1;
    }
  }
);

// Improved initialization logic when component is mounted
onMounted(() => {
  console.log("ModeSelector mounted:", {
    modelValue: props.modelValue,
    prefillStation: props.prefillDepartureStation,
    isAdditionalMode: props.additionalMode,
  });

  // If we already have a modelValue, use it to initialize the component
  if (props.modelValue) {
    const val = props.modelValue;

    // Set isAdditionalMode based on the mode type
    const additionalMode = additionalModes.includes(val.mode);
    isAdditionalMode.value = additionalMode;

    // Set the selected mode
    selectedMode.value = val.mode;

    if (val.mode === "Bus") {
      busLineInput.value = val.line || "";

      if (val.departureStation && val.arrivalStation) {
        departureStation.value = val.departureStation;
        arrivalStation.value = val.arrivalStation;
        step.value = 5; // Ready state
      } else if (val.departureStation) {
        departureStation.value = val.departureStation;
        step.value = 3; // Select arrival station
      } else {
        step.value = 2; // Select departure station
      }
    } else if (additionalMode) {
      // For other additional modes, just show the mode
      step.value = 2;
    } else {
      // For standard modes (Métro, RER, etc.)
      selectedLine.value = val.line;

      if (val.departureStation && val.arrivalStation) {
        departureStation.value = val.departureStation;
        arrivalStation.value = val.arrivalStation;
        step.value = 5; // Ready state
      } else if (val.departureStation) {
        departureStation.value = val.departureStation;
        step.value = 4; // Select arrival station
      } else if (val.line) {
        step.value = 3; // Select departure station
      } else {
        step.value = 2; // Select line
      }
    }
  }
  // If we don't have a modelValue but have a prefilled station, start with mode selection
  else if (props.prefillDepartureStation) {
    console.log(
      `Initializing with correspondence station: ${props.prefillDepartureStation.name}`
    );

    // In correspondence mode, start with mode selection (step 1)
    // This allows the user to select which mode they want to use at the correspondence station
    step.value = 1;

    // Don't pre-select anything, let the user choose
    selectedMode.value = "";
    isAdditionalMode.value = false;

    // Do not emit any update yet - wait for user selection
  }
});

// Add debug computed property to always show the current state
const debugState = computed(() => {
  return {
    step: step.value,
    selectedMode: selectedMode.value,
    selectedLine: selectedLine.value
      ? typeof selectedLine.value === "string"
        ? selectedLine.value
        : selectedLine.value.name
      : null,
    departureStation: departureStation.value
      ? departureStation.value.name
      : null,
    arrivalStation: arrivalStation.value ? arrivalStation.value.name : null,
    prefillStation: props.prefillDepartureStation
      ? props.prefillDepartureStation.name
      : null,
  };
});

// Log state changes for debugging
watch(
  debugState,
  (newState) => {
    console.log("ModeSelector state updated:", newState);
  },
  { deep: true }
);

// Helper function to find matching stations across different transport modes
const findMatchingStation = (targetStation, availableStations) => {
  if (!targetStation || !availableStations || availableStations.length === 0) {
    return null;
  }

  console.log(`Looking for a match for station: ${targetStation.name}`);

  // Only use exact name matching - most reliable approach
  const matchingStation = availableStations.find(
    (station) => station.name === targetStation.name
  );

  if (matchingStation) {
    console.log(`Found exact name match for ${matchingStation.name}`);
    return matchingStation;
  }

  console.log(`No matching station found for ${targetStation.name}`);
  return null;
};

// Helper function to check if a station is prefilled
const isPrefilled = (station) => {
  if (!props.prefillDepartureStation || !station) return false;

  try {
    // Use our enhanced station matching helper with error handling
    return stationMatches(station, props.prefillDepartureStation);
  } catch (e) {
    console.error(
      "Error in isPrefilled, falling back to direct comparison:",
      e
    );
    // Fallback to direct comparison
    return station.name === props.prefillDepartureStation.name;
  }
};

// Function to handle correspondence stations
const handleCorrespondenceStation = () => {
  if (!props.prefillDepartureStation) return false;

  // In step 1, just let user select a mode
  if (step.value === 1) {
    return false; // Let the user select the mode
  }

  // For additional modes, handle specially
  if (step.value === 2 && selectedMode.value) {
    // For additional modes like Bus, Marche, etc.
    if (additionalModes.includes(selectedMode.value)) {
      if (selectedMode.value === "Bus") {
        return false; // Let user enter bus line
      } else {
        // For other additional modes, auto-set the departure station
        departureStation.value = props.prefillDepartureStation;
        updateModelValue();
        return true;
      }
    }

    // For standard modes (RER, Métro), let selectLine handle it
    return false;
  }

  return false;
};

// Modify the watch for prefillDepartureStation
watch(
  () => props.prefillDepartureStation,
  (newStation) => {
    if (newStation) {
      console.log("Prefill station changed:", newStation.name);

      // First, try to handle it as a correspondence
      if (handleCorrespondenceStation()) {
        // If correspondence was handled successfully, we're done
        return;
      }

      // Otherwise, fall back to regular behavior
      if (step.value === 1) {
        // Auto-select RER as default mode when prefilled
        selectMode("RER");
      }

      // If we have a mode selected but no line yet, try to find a line containing this station
      if (step.value === 2 && selectedMode.value) {
        const mode = selectedMode.value;
        const allLines = availableLines.value;

        // Find a line that contains this exact station name
        let foundLine = null;
        for (const line of allLines) {
          if (!line.stations) continue;

          try {
            // Try to find a station match with error handling
            const hasExactStation = line.stations.some((station) => {
              try {
                return stationMatches(station, newStation);
              } catch (e) {
                console.error(
                  "Error in station matching during line search:",
                  e
                );
                // Fall back to direct comparison
                return station.name === newStation.name;
              }
            });

            if (hasExactStation) {
              console.log(
                `Found line ${line.name} containing station ${newStation.name}`
              );
              foundLine = line;
              break;
            }
          } catch (e) {
            console.error(`Error checking stations for line ${line.name}:`, e);
            continue;
          }
        }

        // If found, select the line
        if (foundLine) {
          selectLine(foundLine.name);
        } else {
          console.warn(`No line found containing station: ${newStation.name}`);
        }
      }

      // If we already have a mode and line selected, we can directly use the prefilled station
      if (step.value === 3 && selectedMode.value && selectedLine.value) {
        // Find the station with exact name match in the available stations
        const stations = selectedLineStations.value;
        if (!stations || stations.length === 0) {
          console.warn("No stations available for the selected line");
          return;
        }

        const matchingStation = stations.find((station) =>
          stationMatches(station, newStation)
        );

        if (matchingStation) {
          console.log(
            `Auto-selecting prefilled departure station: ${matchingStation.name}`
          );
          departureStation.value = matchingStation;
          departureSearch.value = matchingStation.name;
          step.value = 4; // Skip directly to arrival station selection

          // Filter arrival stations immediately
          filterArrivalStations();
        } else {
          console.warn(
            `Could not find prefilled station "${newStation.name}" in selected line stations`
          );
        }
      }
    }
  },
  { immediate: true }
);

// Modified the bus line input handler to update on change
watch(busLineInput, (newVal) => {
  if (newVal && newVal.trim() !== "") {
    updateModelValue();
  }
});

const updateBusLine = () => {
  // Update the model immediately when bus line changes
  if (busLineInput.value && busLineInput.value.trim() !== "") {
    emit("update:modelValue", {
      mode: selectedMode.value,
      line: busLineInput.value,
      departureStation: null,
      arrivalStation: null,
    });
    // Don't set step to 5 - let the parent component handle the next step
  }
};
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

.prefill-indicator {
  background-color: #354770;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  border-left: 4px solid #4a90e2;
}

.prefill-message {
  color: white;
  font-weight: 500;
}

.prefill-icon {
  margin-right: 5px;
  color: #4a90e2;
}

.prefill-tag {
  background-color: #4a5a83;
  padding: 2px 5px;
  border-radius: 4px;
  margin-left: 5px;
}

.prefilled-station {
  background-color: #4a5a83;
}

.connection-label {
  font-weight: normal;
  margin-left: 5px;
  color: white;
}

.from-label {
  font-weight: normal;
  margin-left: 5px;
  color: white;
}

.prefill-info {
  background-color: #354770;
  padding: 5px;
  border-radius: 4px;
  margin-top: 10px;
}

.info-message {
  color: white;
}

.info-icon {
  margin-right: 5px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.button-group button {
  flex: 1;
}

.btn-primary {
  background-color: #2ea44f;
}

.btn-primary:hover {
  background-color: #2a8c46;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.correspondence-notice {
  background-color: #354770;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  border-left: 4px solid #4a90e2;
}

.notice-content {
  color: white;
  font-weight: 500;
}

.notice-icon {
  margin-right: 5px;
  color: #4a90e2;
}

.correspondence-banner {
  background-color: #4a90e2;
  color: white;
  padding: 10px;
  border-radius: 4px 4px 0 0;
  margin: -15px -15px 15px -15px;
  text-align: center;
  font-weight: bold;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.banner-icon {
  margin-right: 8px;
  font-size: 18px;
}

.banner-text {
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner-subtitle {
  font-size: 14px;
  font-weight: normal;
  margin-top: 5px;
  opacity: 0.9;
}

/* Add style for the correspondence tag */
.correspondence-tag {
  font-size: 0.9em;
  color: #4a90e2;
  font-style: italic;
  margin-left: 5px;
}
</style>