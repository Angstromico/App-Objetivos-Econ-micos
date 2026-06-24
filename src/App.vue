<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useProyectosStore } from '@/stores/proyectos.store';

const store = useProyectosStore();

onMounted(() => {
  store.cargarProyectos();
});
</script>
