<template>
   <ion-page id="vue-rapipago-app-pago">
      <base-page>
         <ion-content class="secondary" fullscreen>
            <ion-item lines="full">
               <ion-grid class="ion-text-center">
                  <ion-row>
                     <ion-col size="12">
                        <div>
                           <ion-title>{{ serviceName }}</ion-title>
                           <small>Preparación de pago</small>
                        </div>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </ion-item>
            <br>
            <ion-list v-if="currVencimiento">
               <ion-item lines="full">
                  <ion-grid>
                     <ion-row>
                        <ion-col size="6">Tu saldo</ion-col>
                        <ion-col size="6">$ {{ saldoDisponible }}</ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>

               <ion-item lines="full" v-if="currVencimiento.amount1 && currVencimiento.amount1 > 0">
                  <ion-grid>
                     <ion-row>
                        <ion-col size="6">Importe ($)</ion-col>
                        <ion-col size="6">$ {{ currVencimiento.amount1 }}</ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>

               <!-- MONTO PARA FACTURAS TIPO ESC (NO CEI) -->

               <ion-item lines="full" v-if="isESC == true">
                  <ion-grid>
                     <ion-row>
                        <ion-col size="6">Monto a pagar</ion-col>
                        <ion-col size="6">$ {{ montoFinal }}</ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>

               <!-- MONTO PARA FACTURAS TIPO CEI / CLR -->

               <ion-item lines="full" v-if="isCEI == true">
                  <ion-grid>
                     <ion-row>
                        <ion-col size="12">
                           <div>
                              <ion-label>Selecciona el importe a pagar:</ion-label>
                           </div>
                        </ion-col>
                        <ion-col size="12">
                           <ion-list>
                              <ion-radio-group :value="currVencimiento.amount1" @ionChange="montoFinal = $event.target.value">
                                 <ion-item lines="full" style="--padding-start: 0;">
                                    <ion-label>$ {{ currVencimiento.amount1 }}</ion-label>
                                    <ion-radio slot="start" :value="currVencimiento.amount1" color="modatex"
                                       style="margin-inline-end: 0.75em" />
                                 </ion-item>
                                 <ion-item lines="full" style="--padding-start: 0;">
                                    <ion-label>$ {{ currVencimiento.amount2 }}</ion-label>
                                    <ion-radio slot="start" :value="currVencimiento.amount2" color="modatex"
                                       style="margin-inline-end: 0.75em" />
                                 </ion-item>
                              </ion-radio-group>
                           </ion-list>
                        </ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>

               <!-- MONTO PARA FACTURAS TIPO ABI -->

               <ion-item lines="full" v-if="isABI == true">
                  <ion-grid>
                     <ion-row>
                        <ion-col size="12">
                           <div>
                              Ingresa el monto que deseas pagar: <br>
                              <small>{{ intervaloMontos }}</small>
                           </div>
                        </ion-col>
                        <ion-col size="12">
                           <ion-input v-model="montoFinal" @input="montoFinal = $event.target.value"
                              :placeholder="'$ ' + currVencimiento.maxAmount1" />
                        </ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>

               <ion-item lines="full">
                  <ion-grid>
                     <ion-row>
                        <ion-col size="6">Subtotal saldo</ion-col>
                        <ion-col size="6">$ {{ saldoActualizado }}</ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>

               <ion-item lines="full">
                  <ion-button color="success" style="min-width: 100%" @click="realizarPago" expand="block"
                     :disabled="isBtnDisabled">Finalizar pago</ion-button>
               </ion-item>
            </ion-list>
         </ion-content>
      </base-page>
   </ion-page>
</template>
 
<script setup lang="ts">
import { runAlert, runLoader } from '@/libs';
import appStore from '@/store/app';
import useRapipagoStore from '@/store/rapipago';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonList, IonRadio, IonRadioGroup } from '@ionic/vue'
import BasePage from '@/components/BasePage.vue';

const montoFinal = ref<any>(0)
const respuesta = ref<any>({})
const isBtnDisabled = ref<boolean>(false)
const globalStore = appStore()
const rapipagoStore = useRapipagoStore()
const { serviceId, serviceName } = storeToRefs(rapipagoStore)
const route = useRoute()
const router = useRouter()

const saldoDisponible = computed(() => {
   let saldo = localStorage.available.replace(",", ".");
   return Number.parseFloat(saldo);
})

const vencimientoId  = computed(() => {
   return route.params.vencimientoId;     
})

const vencimientos  = computed(() => {
   return JSON.parse(String(localStorage.rapiVencimientos));
})

const currVencimiento  = computed(() => {
   const selected = vencimientos.value[String(vencimientoId.value)];
   console.log(selected);
   return selected;
})

const isCEI  = computed(() => {
   return (currVencimiento.value.amount2 > 0) ? true : false;
})

const isABI  = computed(() => {
   let is = (currVencimiento.value.amountType == 'ABI') ? true : false;
   return is;
})

const isESC  = computed(() => {            
   if (currVencimiento.value.amountType == 'ESC') {                        
         return true;
   }
   return false;
})

const intervaloMontos = computed(() => {
   return `Ingresá un valor entre $${currVencimiento.value.minAmount1} y $${currVencimiento.value.maxAmount1}`;
})

const saldoActualizado  = computed(() => {
   return saldoDisponible.value - montoFinal.value;
})

const configurarMonto = ()  => {     
   console.log("conf monto", currVencimiento.value, isCEI.value, isESC.value);
         
   if (isESC.value != false || isCEI.value != false) 
      montoFinal.value = currVencimiento.value.amount1;      
}


const realizarPago = async () => {
   
   const loader = await runLoader('Procesando pago, aguarde.')
   
   let formPago: any = {};

   if (currVencimiento.value.type == 'barcode') {
      formPago = {
            "companyCode": currVencimiento.value.companyCode,
            "companyName": currVencimiento.value.companyName,
            "paymentModeId": currVencimiento.value.paymentModeId,
            "barcode": currVencimiento.value.barcode,
            "amount": montoFinal.value,
            "amountType": currVencimiento.value.amountType,
            "clientId": currVencimiento.value.clientId,
            "reference": currVencimiento.value.reference,
            "expirationDate": currVencimiento.value.expirationDate,
            "hash": currVencimiento.value.hash,
            "type": "barcode"                            
      }
   }

   if (currVencimiento.value.type == 'fetchedBill') {
      formPago = {
            "companyCode": currVencimiento.value.companyCode,
            "companyName": currVencimiento.value.companyName,
            "clientId": currVencimiento.value.clientId,
            "paymentModeId": currVencimiento.value.paymentModeId,
            "barcode": currVencimiento.value.barcode,
            "amount": montoFinal.value,
            "amountType": currVencimiento.value.amountType,
            "expirationDate": currVencimiento.value.expirationDate,
            "reference": currVencimiento.value.reference,
            "additionalData":currVencimiento.value.additionalData,
            "hash": currVencimiento.value.hash,
            "searchForm" : JSON.parse(localStorage.rapiSearchForm),
            "type": "fetchedBill"                            
      }                        
   }                    

   formPago.paymentMethod = "PES";
   formPago.rapipago_token = rapipagoStore.authToken;

   await rapipagoStore.logAction(formPago);

   if (isABI.value != false) {
         
         let montoAceptable = ( montoFinal.value > 0 && (montoFinal.value >= currVencimiento.value.minAmount1 && montoFinal.value <= currVencimiento.value.maxAmount1) ) ? true : false;

         if (!montoAceptable) {
            loader.dismiss()
            await runAlert(intervaloMontos.value)
            return;
         }
   }

   await globalStore.getBalance()

   await rapipagoStore.getToken()
   
   
   if (Number.parseFloat(montoFinal.value) > Number.parseFloat(localStorage.available)) {
      
      loader.dismiss()

      runAlert('No poseés saldo suficiente para pagar este servicio.');      
      
      return false;
   }   
   
   isBtnDisabled.value = true;

   try {   

      const http = await rapipagoStore.http.post(`preparePayment/NOCAB`, formPago)
      const data = await http.data;

      if (data.errors) {
         throw new Error(data.errors)   
      }

      formPago.operationId = data.operationId;

      localStorage.rapiTicket = JSON.stringify(data.response.ticket);
      

      return router.replace({ name : 'app.rapipago.ticket', params : { transferenceId : data.transference.id }})

   } catch (error) { 
      
      await rapipagoStore.ajaxError(error)

   } finally {

      loader.dismiss()
   }
}

onBeforeMount(async () => {
   configurarMonto()
   await rapipagoStore.getToken()
   await globalStore.getBalance()
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
}</style>