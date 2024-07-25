<template>
   <ion-page>
      <base-page>
         <ion-content fullscreen color="light">
            <ion-item lines="full">
               <ion-grid>
                  <ion-row class="ion-text-center">
                     <ion-col size="12">
                        <ion-text class="ion-text-center">{{ store.serviceName }}</ion-text>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </ion-item>
            <ion-item color="primary">
               <ion-grid>
                  <ion-row class="ion-text-center">
                     <ion-col size="12">
                        <ion-text class="ion-text-center">{{ pageCaption }}</ion-text>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </ion-item>
            <ion-grid>
               <ion-row>
                  <ion-col size="12">
                     <ion-list class="list-pagos">
                        <ion-item lines="full" v-for="(invoice, iInvoice) of invoices" :key="iInvoice">
                           <div class="item-pago">
                              <ion-label>
                                 <div style="white-space: normal;">
                                    Factura N°:  
                                    <p>
                                       {{ invoice.barcode }}
                                    </p>
                                 </div>
                                 <br>
                                 <template v-if="showExpirationDate(invoice)">
                                    <div>
                                       Fecha de invoice : <b>{{ invoice.expirationDate }}</b>
                                    </div>
                                 </template>
                                 <template v-if="isESC(invoice)">
                                    Monto a pagar: <b>${{ invoice.amount1 }}</b>
                                 </template> 
                                 <template v-if="isCEI(invoice)">
                                    Importe sugerido: <b>${{ invoice.amount1 }}</b>
                                    <br>
                                    Importe aceptado: <b>${{ invoice.amount2 }}</b>                      
                                 </template>                        
                                 <template v-if="isABI(invoice)">
                                    Importe mínimo: <b>${{ invoice.minAmount1 }}</b>
                                    <br>
                                    Importe máximo: <b>${{ invoice.maxAmount1 }}</b>
                                 </template>                                                    
                              </ion-label>
                              <br>
                              <div v-if="!invoice.expired">
                                 <ion-button color="success" @click="actionPagar(iInvoice)">Pagar</ion-button>
                              </div>
                              <ion-label color="danger" v-else>¡Factura vencida!</ion-label>
                           </div>
                        </ion-item>     
                     </ion-list>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </base-page>
   </ion-page>
</template>
<script setup lang="ts">
import useRapipagoStore from '@/store/rapipago';
import { computed } from 'vue'
import { useRouter } from 'vue-router';
import { IonList } from '@ionic/vue';
import BasePage from '@/components/BasePage.vue';

const store = useRapipagoStore()
const invoices = computed( () => JSON.parse(String(localStorage.rapiVencimientos)) )
const pageCaption = computed( () => (invoices.value.length > 1) ? `Tenés (${invoices.value.length}) vencimientos próximos a pagar` : "Tenés 1 vencimiento       proximo a pagar")
const router = useRouter()

const showExpirationDate = ( invoice: any ) => {
   if (invoice.expirationDate && invoice.expirationDate != null) {
      return true;
   }
   return false;
}


function isESC ( vencimiento: any ) {
   if (vencimiento.amountType == 'ESC' && !vencimiento.amount2) {
      return true;
   }
   return false;
}
function isCEI ( vencimiento: any ) {
   if (vencimiento.amount2 > 0) {
      return true;
   }
   return false;
}
function isABI ( vencimiento: any ) {
   if (vencimiento.amountType == 'ABI') {
      return true;
   }
   return false;
}

function actionPagar ( index: string|number ) {
   return router.push({ name : 'app.rapipago.pay', params : {
      companyId : store.serviceId,
      companyName : encodeURI(store.serviceName),
      vencimientoId : index
   }});
}

</script>
<style>
  .item-pago {
    width: 100% !important;
    padding-top: 1em;
    padding-bottom: 1em;
  }
  .bg-factura {
    padding-top : 1em;
    padding-bottom : 1em;
  }
  .bg-success {
    background-color: #5aad85;
    color : #fff;
  }
</style>
<style scoped>
    ion-button   {
        border: none !important;
        -webkit-box-shadow: none;
        box-shadow: none;
        --background: #b1b1b1;
        --background-hover : #b1b1b1;
        --color: rgb(68, 68, 68);
        --box-shadow: none;
    }
</style>