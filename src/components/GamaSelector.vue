<!-- src/components/GamaSelector.vue -->
<template>
  <ion-segment
    :value="gamaActual"
    @ionChange="handleSegmentChange"
    class="gama-segment"
    select-on-focus
  >
    <ion-segment-button
      v-for="gama in gamas"
      :key="gama"
      :value="gama"
      class="gama-button"
    >
      <ion-label class="gama-label">{{ labelMap[gama] }}</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup lang="ts">
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { Gama } from '@/core/interfaces/models';

defineProps<{
  gamaActual: Gama;
  proyectoId: string;
  itemId: string;
}>();

const emit = defineEmits<{
  (e: 'update:gama', gama: Gama): void;
}>();

const gamas: Gama[] = Object.values(Gama);

const labelMap: Record<Gama, string> = {
  [Gama.Usada]: 'Usada',
  [Gama.Economica]: 'Económica',
  [Gama.Intermedia]: 'Intermedia',
  [Gama.Cara]: 'Cara',
  [Gama.Nueva]: 'Nueva',
};

function handleSegmentChange(event: CustomEvent): void {
  const value = event.detail.value as Gama | undefined;
  if (value) {
    emit('update:gama', value);
  }
}
</script>

<style scoped>
.gama-segment {
  --background: var(--ion-color-light);
  border-radius: 10px;
  padding: 3px;
  margin: 6px 0;
}

.gama-button {
  --color: var(--ion-color-medium);
  --color-checked: var(--ion-color-primary);
  --indicator-color: var(--ion-background-color, #ffffff);
  font-weight: 500;
  font-size: 0.78rem;
  min-height: 32px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.gama-button:hover {
  opacity: 0.95;
}

.gama-label {
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.01em;
}
</style>
