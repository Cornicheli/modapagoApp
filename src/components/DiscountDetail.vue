<script setup lang="ts">
import { modalController } from '@ionic/vue';
import { arrowBackSharp, informationCircle, informationCircleOutline, informationCircleSharp } from 'ionicons/icons';

defineProps<{ item: any }>()

const closeModal = () => { modalController.dismiss() }
</script>

<template>
   <ion-page id="discount-detail">
      <ion-header>
         <ion-toolbar>
            <ion-icon :icon="arrowBackSharp" class="ion-margin-start" style="font-size: 1.3rem;" slot="start"  @click="closeModal"/>
            <ion-title>Detalle del descuento</ion-title>
         </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
         <ion-item lines="full">
            <h6>Datos del local</h6>
         </ion-item>
         <ion-item lines="none">
            Nombre: {{ item.local?.name }}
         </ion-item>
         <ion-item lines="none">
            Dirección: {{ item.local?.address }}
         </ion-item>
         <ion-item lines="full">
            <h6>Datos del descuento</h6>
         </ion-item>
         <ion-item lines="none">
            Porcentaje: {{ item.discount.percentage }} %
         </ion-item>
         <ion-item lines="none">
            Tope: {{ item.discount.max_price }}ARS
         </ion-item>
         <ion-item color="modapago" class="ion-padding-vertical ion-margin-top">
            <ion-icon :icon="informationCircle" style="font-size: 2.4rem" class="ion-margin-end"></ion-icon>
            <ion-label class="ion-text-wrap">
               Para usar este descuento tienes que escanear el QR del local y se te aplicara en el momento que tengas que confirmar la operacion.
            </ion-label>
         </ion-item>
      </ion-content>
   </ion-page>
</template>

<style scoped>
#discount-detail ion-label { font-size: 0.9rem; line-height: 1.2; }
</style>