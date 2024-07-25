<template>
   <ion-page>
      <base-page>
         <ion-content class="secondary" fullscreen>
            <ion-item>
               <ion-grid class="ion-text-center">
                  <ion-row>
                     <ion-col size="12">
                        <ion-title>{{ empresa }}</ion-title>
                        <small>Preparación de pago</small>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </ion-item>
            <ion-list lines="none">
               <ion-item lines="full">
                  <ion-grid>
                     <ion-row>
                        <ion-col size="6">Tu saldo actual</ion-col>
                        <ion-col size="6">$ {{ saldoDisponible }}</ion-col>
                     </ion-row>
                     <ion-row>
                        <ion-col size="6">Total a pagar</ion-col>
                        <ion-col size="6">$ {{ montoIngresado }}</ion-col>
                     </ion-row>
                     <ion-row>
                        <ion-col size="6">Saldo restante</ion-col>
                        <ion-col size="6">$ {{ saldoActualizado }}</ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>
               <ion-item lines="none">
                  <ion-button color="success" style="min-width: 100%" @click="realizarPago" expand="block"
                     :disabled="isBtnDisabled">Finalizar pago</ion-button>
               </ion-item>
            </ion-list>
         </ion-content>
      </base-page>
   </ion-page>
</template>
 
 
<script setup lang="ts">
import useRapipagoStore from '@/store/rapipago'
import appStore from '@/store/app'
import { computed, onBeforeMount, ref } from 'vue';
import { runAlert, runLoader } from '@/libs';
import { useRoute, useRouter } from 'vue-router';
import { IonList } from '@ionic/vue';
import BasePage from '@/components/BasePage.vue';

const rapipagoStore = useRapipagoStore()
const store = appStore()
const router = useRouter()

const isBtnDisabled = ref<any>(false)
const montoFinal = ref<any>(0)


const empresa = computed( () => rapipagoStore.serviceName )
const pago = computed(() => {
   const { form } =  JSON.parse(localStorage.rapiSearchForm);
   return form;
});
const saldoDisponible = computed( () => {
   let saldo = localStorage.available.replace(",", ".");
   return Number.parseFloat(saldo);
})
const saldoActualizado = computed( () => {
   return saldoDisponible.value - montoIngresado.value
})
const montoIngresado = computed( () => {
   return pago.value.IV1 || pago.value.C35;
})

const realizarPago = async () => {
      
      const loader = await runLoader("Realizando pago");
                        
      let formPago = JSON.parse(localStorage.rapiSearchForm);       

      formPago.rapipago_token = rapipagoStore.authToken;

      await rapipagoStore.logAction(formPago);

      isBtnDisabled.value = true;


      await store.getBalance()

      if (Number.parseFloat(montoFinal.value) > Number.parseFloat(localStorage.available)) {
         
         runAlert('No posees saldo suficiente para pagar este servicio.');

         return false;
      }

      rapipagoStore.http.post(`preparePayment/CAB?token=${store.token}`, formPago).then( response => {

         let { data } = response;

         if (!data.operationId && !data.errors) {
               throw new Error("No se pudo procesar la operación. Intenta nuevamente mas tarde.");                
         }
         
         if (data.errors) {
            throw new Error( data.errors );
         }

         // si todo esta bien... pasemos a confirmar el pago.

         console.log("Preparacion OK >>> ", data);

         let {operationId} = data;

         formPago.operationId = operationId;
         formPago.amount = data.amount;
         
         //context.montoFinal = data.amount;
         
         localStorage.rapiTicket = JSON.stringify(data.response.ticket);
         

         console.log(data.transference);

         return router.replace({ name : 'app.rapipago.ticket', params : { transferenceId : data.transference.id }})                     

      })
      .catch( ppErrors => {

         isBtnDisabled.value = false;
         
         rapipagoStore.ajaxError(ppErrors)
         
         console.log("ERROR AL PREPARAR EL PAGO !!! >>>> ", ppErrors);
      })
      .finally( () => {

         loader.dismiss()
      })

}

onBeforeMount(async () => {
   await store.getBalance()
   await rapipagoStore.getToken()
   montoFinal.value = montoIngresado.value;
})
</script>
 
<style scoped>
ion-button {
   border: none !important;
   -webkit-box-shadow: none;
   box-shadow: none;
   --background: #b1b1b1;
   --background-hover: #b1b1b1;
   --color: rgb(68, 68, 68);
   --box-shadow: none;
}
</style>