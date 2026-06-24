<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Proyecto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Detalle</ion-title>
        </ion-toolbar>
      </ion-header>

      <section class="ion-padding">
        <template v-if="proyecto">
          <h1>{{ proyecto.nombre }}</h1>
          <p>{{ proyecto.descripcion || 'Sin descripción disponible.' }}</p>
          <p><strong>Moneda:</strong> {{ proyecto.monedaSimbol }}</p>
          <p><strong>Ahorro actual:</strong> {{ proyecto.ahorroActual }}</p>
        </template>
        <template v-else>
          <p>
            Proyecto no encontrado. Vuelve al inicio y selecciona un proyecto
            válido.
          </p>
        </template>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { useProyectosStore } from '@/stores/proyectos.store'
import type { Proyecto } from '@/core/interfaces/models'

interface Props {
  id: string
}

const props = defineProps<Props>()
const store = useProyectosStore()

const proyecto = computed<Proyecto | undefined>(() =>
  store.proyectos.find((item) => item.id === props.id),
)
</script>
