<!-- src/components/BarraProgreso.vue -->
<template>
  <div class="progress-container">
    <div class="progress-info">
      <span class="progress-label">{{ etiqueta }}</span>
      <span class="progress-value">{{ porcentaje.toFixed(1) }}%</span>
    </div>
    <ion-progress-bar
      :color="color"
      :value="porcentaje / 100"
      class="progress-bar"
    ></ion-progress-bar>
  </div>
</template>

<script setup lang="ts">
import { IonProgressBar } from '@ionic/vue';

defineProps<{
  porcentaje: number; // 0-100
  etiqueta: string; // 'Meta Mínima' | 'Meta Ideal'
  color: string; // 'success' | 'warning' | 'danger'
}>();
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 10px 0;
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.progress-label {
  color: var(--ion-color-medium);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.progress-value {
  font-family: var(--ion-font-family, inherit);
  font-weight: 700;
  color: var(--ion-color-dark);
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
