<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import usePagofaciStore from '@/store/pagofacil';
import { onBeforeMount, onBeforeUpdate, onMounted, onUpdated, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { IonLoading, IonSelect, IonSelectOption, onIonViewDidEnter, onIonViewWillEnter } from '@ionic/vue';
import { axios, runAlert, runLoader, runToast } from '@/libs';
import { isAxiosError } from 'axios';
import { ticket } from 'ionicons/icons';

const router = useRouter()
const store  = usePagofaciStore()
const selection = ref()
const paying = ref(true)

const confirmOperation = async () => {

   if(selection.value >= 0) {

      const operationId = store.invoice[selection.value].idTransaccion;

      const loader = await runLoader('Procesando pago, aguarde.')

      try {
         
         const response = await axios.post(import.meta.env.VITE_APP_PAGOFACIL_URL + '/operation/confirm' , {
            idTransaccion : operationId
         })

         const { api_response, api_status } = await response.data;

         console.log(api_status, api_response);

         if(api_status==201) {
            store.ticket = api_response;
            store.invoice = undefined;
            return await router.replace({ name : 'pagofacil.ticket' })
         }
         
         if(api_status==400)
            throw new Error("Error al procesar la solicitud, intenta nuevamente.");
         
         if(api_status==401)
            throw new Error("Error interno en modapago, por favor saca captura de tu pantalla y enviala a soporte@modapago.com con el asunto: Pagofacil - Error.");

         if(api_status==404)
            throw new Error("Debés seleccionar al menos 1 vencimiento.");

         if(api_status==500)
            throw new Error("Servicio no disponible.");
            
         if(api_status==504)
            return await router.replace({name : 'pagofacil.payment.pending'})

      } catch (error) {
         
         if (isAxiosError(error)) {
            return await runAlert(error.response?.data.message);
         }

         return await runAlert(String(error));

      } finally {

         loader.dismiss()
      }

   } else {

      return await runToast('Seleccione el vencimiento que desea pagar.');
   }
}

onIonViewWillEnter( async () => {
   if (store.invoice == undefined && store.ticket) {
      return await router.replace({ name : 'pagofacil' })
   }
})

</script>
<template>
   <ion-page>
      <BasePage>      
         <ion-content fullscreen color="light">
            <ion-header>
               <ion-toolbar  style="padding: 5px">
                  <ion-title class="ion-text-center">Vencimientos</ion-title>
               </ion-toolbar>
            </ion-header>
            <ion-grid class="ion-margin-top">
               <ion-row>
                  <ion-col size="12">
                     <ion-list class="ion-padding-bottom">
                        <ion-list-header color="medium">
                           Confirmacion de importe
                        </ion-list-header>
                        <ion-item>
                           <ion-select placeholder="Seleccione vencimiento" label="Seleccione vencimiento" label-placement="floating" interface="action-sheet" @ion-change="selection = $event.detail.value">
                              <ion-select-option v-for="(form, i) in store.invoice" :value="i">                              
                                 Importe: ${{ form.importe }} | Descripcion: {{ form.descripcion }}                              
                              </ion-select-option>
                           </ion-select>
                        </ion-item>
                        <ion-button class="ion-margin" color="success" expand="block" @click="confirmOperation">Pagar</ion-button>
                     </ion-list>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </BasePage>
   </ion-page>
</template>