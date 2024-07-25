<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import { axios, runAlert, runLoader } from '@/libs';
import usePagofaciStore from '@/store/pagofacil';
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const store = usePagofaciStore()
const { invoice } = storeToRefs(store)
const router = useRouter()

const confirmOperation = async () => {


   const operationId = invoice.value.idTransaccion;

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

}

</script>
<template>
   <ion-page>
      <BasePage>
         <ion-content fullscreen color="light">
            <ion-header>
               <ion-toolbar>
                  <ion-title class="ion-text-center">Vencimientos</ion-title>
               </ion-toolbar>
            </ion-header>
            <ion-grid class="ion-margin-top ion-padding">
               <ion-row class="bg-white">
                  <ion-col size="12">
                     <ion-list class="ion-no-padding" v-if="store.invoice">
                        <ion-list-header color="medium">
                           Detalle de factura
                        </ion-list-header>
                        <ion-item lines="full">
                           <ion-text>Cod. de transaccion: {{ invoice.idTransaccion }}</ion-text>
                        </ion-item>
                        <ion-item lines="full">
                           <ion-text>Descripcion: {{ invoice.descripcion }}</ion-text>
                        </ion-item>
                        <ion-item lines="full">
                           <ion-text>Importe: ${{ invoice.importe }}</ion-text>
                        </ion-item>
                        <ion-button color="success" expand="block" style="margin: 10px;" @click="confirmOperation()">Confirmar pago</ion-button>
                     </ion-list>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </BasePage>
   </ion-page>
</template>