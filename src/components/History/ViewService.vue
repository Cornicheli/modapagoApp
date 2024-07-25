<template>
   <div>
      <ModalHeader title="Pago de servicio" />
      <ion-content>
         <ion-list>
            <ion-item>
               <ion-label text-wrap>
                  <ion-text>
                     <p> Nombre del servicio : <span v-text="service.name"></span></p>
                  </ion-text>
               </ion-label>
            </ion-item>
            <ion-item>
               <ion-text>
                  <h4>Datos de la operación</h4>
               </ion-text>
            </ion-item>
            <ion-item>
               <ion-text>
                  <p>Fecha de la operacion: <span v-text="parseDate(service.created_at)"></span></p>
                  <p>Importe: $ <span v-text="service.amount"></span> </p>
                  <p>Estado: <span v-text="service.pagopymes_status"></span> </p>
               </ion-text>
            </ion-item>
         </ion-list>
      </ion-content>
   </div>
</template>
   
<script setup lang="ts">
import { parseDate } from '@/libs';
import ModalHeader from '../ModalHeader.vue';

defineProps<{ service: any }>()
</script>
   
<style scoped></style>
   
   