<script setup lang="ts">

import DiscountGrid from '@/components/DiscountGrid.vue';
import PaymentOptions from '@/components/PaymentOptions.vue';
import appStore from '@/store/app';
import { faBank, faBuildingColumns, faCashRegister, faDollarSign, faKey, faMoneyBillTransfer, faPassport, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { IonChip } from '@ionic/vue';
import { arrowBackSharp } from 'ionicons/icons';
import { computed, onBeforeMount, ref } from 'vue';

const store = appStore()
const discounts = ref<any>(null)

const loadBalance = async () => {
   if(!store.inAccount) {
      await store.getBalance()      
   }
}

const getDiscounts = async () => {
   
   const http = await store.authAxios().get('/descuentos')
   const {brands} = await http.data
   discounts.value = Object.entries(brands).slice(0,6).map(entry => entry[1])   

}

const enableLink = computed(() => {
   if(!store.inAccount)
      return {name: 'app.home'};

   return { name: 'app.balance' }
})


onBeforeMount(async () =>  { 
   await getDiscounts()
   await loadBalance()
})

</script>
<template>
   <ion-page>
      <ion-content fullscreen class="secondary" v-if="!store.isScannerActive">
         <ion-item class="ion-margin-bottom" color="modapago" :router-link="enableLink" exact detail>
            <ion-grid>
               <ion-row class="ion-text-center">
                  <ion-col size="12" class="ion-padding-vertical">
                     <h3>Mi dinero en Modapago</h3>                  
                     <h3 style="position: relative;" class="ion-margin-top ion-padding-top">
                        <template v-if="store.inAccount">
                           $ <span>{{ store.inAccount[0] }}</span>
                           <span class="mt-price">{{ store.inAccount[1] }}</span>
                        </template>
                        <template v-else>                     
                              <skeleton style="width: 70%; margin: auto; margin-bottom: 10px;" animated />
                              <skeleton style="width: 70%; margin: auto" animated />
                        </template>
                     </h3>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-item>
         <ion-item lines="none" class="ion-margin-bottom">
            <ion-grid class="ion-text-center ion-padding-vertical">
               <ion-row>
                  <ion-col size="12">
                     <h3 v-if="store.user">¡Hola {{ store.user.name }}!</h3>
                     <h3 v-else>
                        <skeleton animated />
                     </h3>                     
                  </ion-col>            
               </ion-row>
               <ion-row class="ion-margin-top">
                  <ion-col size="4" class="ion-text-center" :router-link="{ name : 'app.qr.charge' }">
                     <ion-button class="acceso-directo" color="modapago" shape="round">
                        <fa-icon :icon="faQrcode" class="fa-2x" />
                     </ion-button>
                     <div style="margin-top:5px; font-size: 14px;">Cobrar  <br>con QR</div>
                  </ion-col>
                  <ion-col size="4" class="ion-text-center border-new" :router-link="{ name : 'money.request' }" style="position: relative;">
                     <div class="advisor">
                        Nuevo
                     </div>                     
                     <ion-button class="acceso-directo" color="modapago" shape="round">
                        <fa-icon :icon="faBank"  class="fa-2x"/> 
                     </ion-button>
                     <div style="margin-top:10px; font-size: 14px;">Retirar <br> dinero</div>
                  </ion-col>
                  <ion-col size="4" class="ion-text-center" :router-link="{ name: 'app.transfer' }">
                     <ion-button class="acceso-directo" color="modapago" shape="round">
                        <fa-icon :icon="faMoneyBillTransfer" class="fa-2x" />   
                     </ion-button>
                     <div style="margin-top:5px; font-size: 14px;">
                        Transferir dinero
                     </div>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-item>
         <ion-item lines="none" class="ion-margin-bottom">
            <ion-grid class="ion-text-center">
               <ion-row>
                  <ion-col size="12" class="ion-padding-vertical">
                     <p>Podés pagar con estas opciones:</p>                     
                     <PaymentOptions />
                  </ion-col>            
               </ion-row>
            </ion-grid>
         </ion-item>       
         <ion-item lines="none">
            <ion-grid class="ion-text-center">
               <ion-row>
                  <ion-col size="12" class="ion-padding-vertical">
                     <p>Pagá con QR en tus locales favoritos:</p>                     
                     <DiscountGrid :items="discounts" :from-home="true" />
                  </ion-col>            
               </ion-row>
            </ion-grid>
         </ion-item>     
         <ion-grid>
            <ion-row>
               <ion-col size="10" offset="1">
                  <ion-button expand="block" color="danger" @click="store.logout()">Cerrar sesión</ion-button>
               </ion-col>
            </ion-row>
         </ion-grid>
      </ion-content> 
      <ion-content fullscreen style="position:relative; --background: transparent;" v-else>
         <ion-button expand="block" color="modapago" class="cancelScan" @click="store.stopScan">
            <ion-icon :icon="arrowBackSharp" style="margin-right: 10px;"></ion-icon>
            Cancelar
         </ion-button>
         <div class="scanOverlayCustom qr"></div>
      </ion-content>
   </ion-page>
</template>
<style scoped>
.acceso-directo {
   width: 65px;
   height: 65px;
}
.advisor {
   position: absolute;
   font-size: 14px;
   top: 60%;
   left: 50%;
   transform: translate(-48%, -50%);
   z-index: 3000;
   display: block;
   padding: 5px 10px; 
   width: auto; 
   background-color: rgb(129, 162, 221);
   color: white;
   border-radius: 10px;

}
</style>