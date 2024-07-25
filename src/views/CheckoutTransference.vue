<script setup lang="ts">
import { IonAvatar, IonTextarea, modalController } from '@ionic/vue';
import appStore from '@/store/app'
import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue';
import { getData, notFoundShopImage, runToast, shopImage } from '@/libs';
import { arrowForward } from 'ionicons/icons';
import ConfirmTransference from '@/components/ConfirmTransference.vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import useTransferenceStore from '@/store/transferences'
import { storeToRefs } from 'pinia';
import BasePage from '@/components/BasePage.vue';

const store = appStore()
const fetching = ref(true)
const transferenceStore = useTransferenceStore()
const router = useRouter()

const { getDestinatary } = storeToRefs(transferenceStore)

const available = computed( () => {
   const data = store.available
   return "$ " + data.join('.')
})

const form = reactive({
   amount: undefined,
   comments: undefined,
   destinatary : {}
})

const confirmTranferenceModal = () => {
   
   if(form.amount && Number(form.amount) > 0) {

      form.destinatary = getDestinatary.value

      modalController.create({
         component : ConfirmTransference,
         componentProps : {
            transference: form
         }
      })
      .then( modal => modal.present() )

   } else {
      runToast('Ingrese un monto válido mayor a 0')
      return false
   }
}

onMounted(async () => {
   await store.getBalance()
   fetching.value = false
})

onBeforeMount(async () => {   
   if (!getDestinatary.value) {
      return router.push('/')
   }
})



onBeforeRouteLeave( (to, from, next) => {
   next()
})

</script>
<style scoped>

</style>
<template>
   <ion-page>
      <base-page>
         <ion-content fullscreen class="secondary">
            <ion-item class="ion-text-center" lines="full">
               <ion-grid>
                  <ion-row class=" ion-padding-vertical">
                     <ion-col size="12">
                        <ion-text>Dinero disponible</ion-text>
                     </ion-col>
                     <ion-col size="12">
                        <h2 style="color: var(--ion-color-success)" v-if="!fetching">{{ available }}</h2>
                        <h2 v-else>
                           <skeleton animated />
                        </h2>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </ion-item>
            <ion-item lines="full" v-if="getDestinatary">                        
                  <ion-avatar style="margin-right: 10px;">
                     <img :src="shopImage(transferenceStore.shopName)" alt="destinatario" @error="notFoundShopImage" />
                  </ion-avatar>
                  <ion-label text-wrap>
                     {{ transferenceStore.shopName }}
                  </ion-label>                      
            </ion-item>
            <ion-item lines="full">
               <ion-input 
                     v-model="form.amount"
                     type="number" 
                     label="Cantidad a transferir: " 
                     label-placement="stacked" 
                     placeholder="Expresado en pesos (ARS)"                   
               />
            </ion-item>
            <ion-item lines="full">
               <ion-textarea v-model="form.comments" label="Comentario (opcional): " label-placement="stacked" :rows="3" placeholder="Ej.: Pago de prendas"></ion-textarea>
            </ion-item>
            <ion-grid>
               <ion-row>
                  <ion-col size="10" offset="1">
                     <ion-button color="modapago" expand="block" :disabled="fetching" @click="confirmTranferenceModal">
                        <ion-label>Transferir</ion-label>
                        <ion-icon slot="end" :icon="arrowForward"></ion-icon>
                     </ion-button>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </base-page>
   </ion-page>
</template>