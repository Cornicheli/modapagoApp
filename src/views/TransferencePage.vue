<script setup lang="ts">
import PaymentOptions from '@/components/PaymentOptions.vue';
import { axios, getData, notFoundShopImage, runAlert, shopImage } from '@/libs'
import { computed, onBeforeMount, ref } from 'vue';
import { IonNote, IonAvatar, IonList, IonIcon, onIonViewDidEnter, useBackButton, modalController } from '@ionic/vue';
import moment from 'moment';
import { arrowBackSharp, arrowForwardCircleSharp, arrowForwardOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import useTransferenceStore from '@/store/transferences';
import appStore from '@/store/app';
import usePagofaciStore from '@/store/pagofacil';

const count = ref<any>([])
const brands = ref<any>([])
const fetching = ref<boolean>(false)
const router = useRouter()
const transferStore = useTransferenceStore()
const globalStore = appStore()
const pagofacilStore = usePagofaciStore()

const getLastTransferences = async () => {
   
   fetching.value = true
   count.value = 0;
   brands.value = {}

   try {
   
      const http = await globalStore.authAxios().get('/most_transfered', {
         params : {
            token: getData('token'),
            start: 0,
            _start: moment(Date.now()).subtract(7, 'days').format('DD/MM/YYYY'),
            _end: moment(Date.now()).format('DD/MM/YYYY'),
            lenght: 5,
            _brand: getData('user').owner.id,
            order: 'desc'            
         }
      })

      const response = await http.data

      brands.value = response.brands

      count.value = brands.value.length

   } catch (error) {

      console.log(error);
      
   } finally {

      fetching.value = false
   }
}


const sendMoney = (destinatary : object) => {

   console.log(destinatary);

   transferStore.destinatary = destinatary
   
   return router.replace({ name: 'app.transfer.checkout' })
}


const ifSomeScannerActive = computed( () => (globalStore.isScannerActive || pagofacilStore.isScannerOpen) )

const killSacanners = () => {
   globalStore.stopScan()
   pagofacilStore.stopScan()
}

useBackButton(-1, () => {
   killSacanners()
})

onIonViewDidEnter( async () => await getLastTransferences() )
</script>
<template>
   <ion-page>
      <ion-content class="secondary" fullscreen v-if="!ifSomeScannerActive">
         <ion-grid>
            <ion-row>
               <ion-col size="12" class="bg-white ion-text-center" style="margin: 5px auto 10px; padding: 10px;">
                  <ion-text style="text-align: center;">¿Cómo quiéres enviar el dinero?</ion-text>                             
               </ion-col>
               <ion-col size="12" class="bg-white">
                  <PaymentOptions :show-modatex-button="true" />
               </ion-col>
               <ion-col size="12" class="bg-white" style="margin-top: 10px;">
                  <ion-item lines="full">
                     <h4 class="ion-text-center">Locales concurridos</h4>
                  </ion-item>                     
                     <ion-list v-if="brands.length > 0">
                        <ion-item v-for="brand in brands.slice(0, 5)" :key="brand.id" lines="full">
                           <ion-avatar slot="start" v-if="brand.group_name">
                                 <img :src="shopImage(brand.group_name)" @error="notFoundShopImage($event)">
                           </ion-avatar>
                           <ion-avatar slot="start" v-else>
                                 <img :src="shopImage(brand.name)" @error="notFoundShopImage($event)">
                           </ion-avatar>
                           <ion-label text-wrap v-if="brand.group_name">
                                 <p>{{brand.group_name}}</p>
                           </ion-label>
                           <ion-label text-wrap v-else>
                                 <p>{{brand.name}}</p>
                           </ion-label>
                           <ion-note slot="end">
                              <ion-button color="modapago" @click="sendMoney(brand)">
                                 <ion-label>Transferir</ion-label>
                                 <IonIcon :icon="arrowForwardOutline" slot="end" />
                              </ion-button>
                           </ion-note>
                        
                        </ion-item>
                     </ion-list>
                     <ion-list v-else-if="fetching == true">
                        <ion-item v-for="i in 5" :key="i" lines="full">
                        <ion-avatar slot="start">
                           <img :src="'../img/logobroken.jpeg'">
                        </ion-avatar>
                        <ion-label>
                           <p><skeleton animated :style="`width: 150px;`"></skeleton></p>
                           <p><skeleton animated :style="`width: 300px;`"></skeleton></p>
                        </ion-label>
                        <ion-note slot="end">
                           <skeleton animated :style="`width: 100px;`"></skeleton>
                        </ion-note>
                        </ion-item>
                     </ion-list>
                     <ion-list v-else-if="brands.length == 0 && fetching == false">
                        <ion-item lines="none">
                           <ion-label>
                              <ion-label class="ion-text-center ion-text-wrap">                              
                                 Empieza a transferir para ver tus locales concurridos.  
                              </ion-label>
                           </ion-label>
                        </ion-item>
                     </ion-list>                  
               </ion-col>
            </ion-row>
         </ion-grid>     
      </ion-content>
      <ion-content fullscreen style="position:relative; --background: transparent;" v-else>
         <ion-button expand="block" color="modapago" class="cancelScan" @click="killSacanners">
            <ion-icon :icon="arrowBackSharp" style="margin-right: 10px;"></ion-icon>
            Cancelar
         </ion-button>
         <div class="scanOverlayCustom qr"></div>
      </ion-content>      
   </ion-page>
</template>