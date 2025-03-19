<!-- CommuneSelector.vue -->
<template>
  <div class="form-group">
    <input
      class="form-control"
      type="number"
      v-model="postalCodeInput"
      @input="search"
      placeholder="Code postal (ex: 92, 54)"
      min="0"
      step="1"
    />
    <input
      class="form-control"
      type="text"
      v-model="communeInput"
      @input="search"
      placeholder="Nom de la commune"
    />
    <div v-if="showDropdown" class="commune-dropdown">
      <div
        v-for="item in filteredCommunes"
        :key="item['CODE INSEE']"
        @click="selectCommune(item)"
        class="commune-option"
      >
        {{ item.COMMUNE }} ({{ item["CODE POSTAL"] }})
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const insee = ref([]);

onMounted(async () => {
  try {
    const response = await fetch("/output.json");
    insee.value = await response.json();
  } catch (error) {
    console.error("Error loading insee data:", error);
  }
});

const props = defineProps({
  modelValue: String,
  postalCodePrefix: String,
});

const emit = defineEmits(["update:modelValue", "update:postalCodePrefix"]);

const postalCodeInput = ref("");
const communeInput = ref("");
const showDropdown = ref(false);
const filteredCommunes = ref([]);

const search = () => {
  if (
    (postalCodeInput.value.length < 2 && communeInput.value.length < 2) ||
    !insee.value.length
  ) {
    showDropdown.value = false;
    return;
  }

  filteredCommunes.value = insee.value
    .filter((item) => {
      if (!item) return false;

      const commune = item.COMMUNE ? item.COMMUNE.toLowerCase() : "";
      const postalCode = item["CODE POSTAL"]
        ? item["CODE POSTAL"].toString()
        : "";

      const postalCodeMatch = postalCode.startsWith(postalCodeInput.value);
      const communeMatch = commune.includes(communeInput.value.toLowerCase());

      return postalCodeMatch && communeMatch;
    })
    .slice(0, 100);

  showDropdown.value = filteredCommunes.value.length > 0;

  // Emit the current inputs as the selected values
  emit("update:modelValue", `${communeInput.value}`);
  emit("update:postalCodePrefix", postalCodeInput.value);
};

const selectCommune = (item) => {
  if (item && item.COMMUNE && item["CODE INSEE"]) {
    communeInput.value = item.COMMUNE;
    postalCodeInput.value = item["CODE POSTAL"]
      ? item["CODE POSTAL"].toString()
      : "";
    emit("update:modelValue", `${item.COMMUNE} - ${item["CODE INSEE"]}`);
    emit("update:postalCodePrefix", postalCodeInput.value);
    showDropdown.value = false;
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const [commune] = newVal.split(" - ");
      communeInput.value = commune || newVal;
    }
  }
);

watch(
  () => props.postalCodePrefix,
  (newVal) => {
    if (newVal && newVal !== postalCodeInput.value) {
      postalCodeInput.value = newVal;
      search();
    }
  }
);
</script>

<style scoped>
.form-group {
  width: 100%;
  box-sizing: border-box;
}

.commune-dropdown {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
  z-index: 10;
  background-color: #354770;
}

.commune-option {
  padding: 10px 8px;
  cursor: pointer;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: white;
  border-bottom: 1px solid #4a5a83;
}

.commune-option:hover {
  background-color: #4a5a83;
}

.form-control {
  margin-bottom: 10px;
  width: 100%;
  padding: 8px;
  border: 1px solid #4a5a83;
  border-radius: 4px;
  background-color: #333;
  color: white;
  box-sizing: border-box;
}

@media screen and (max-width: 480px) {
  .commune-option {
    padding: 8px 5px;
    font-size: 14px;
  }
}
</style>