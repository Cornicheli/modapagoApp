<script setup lang="ts">
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { shopImage, notFoundShopImage, runAlert, runToast } from "@/libs"
import { IonAvatar } from "@ionic/vue";
import { computed, ref, watch } from "vue";
import BasePage from '@/components/BasePage.vue';

const user = computed( () => {
   const storage = localStorage.getItem('user')
   return JSON.parse(String(storage))
})

const qrData = ref()
const amount = ref(0.00)

const generateQr = () => {

   if(amount.value <= 0) {
      runToast('El monto a cobrar debe ser mayor a 0.')
      return;
   }

   qrData.value = JSON.stringify({
      amount : amount.value,
      email  : user.value.email
   })
}

const cleanQr = () => {
   qrData.value = undefined
   amount.value = 0
}

watch(qrData, (a, b) => {
   console.log(a, b);
   
})

</script>
<template>
   <ion-page>
      <BasePage>
         <ion-content class="secondary" fullscreen>
            <ion-item lines="full" class="ion-margin-bottom">
               <IonAvatar slot="start">
                  <img :src="shopImage((user.owner?.group_name || user.owner?.name))" @error="notFoundShopImage" />
               </IonAvatar>
               <ion-text>
                  {{ user.owner.group_name  }}
               </ion-text>
            </ion-item>
            <ion-item lines="full">
               <ion-text class="ion-padding-vertical">
                  <h6 v-if="!qrData">Para tu comodidad puedes generar un codigo QR unico para que puedas recibir dinero de manera mas rapida.</h6>
                  <h6 v-else>Este QR tiene un valor de: ${{ amount }}</h6>
               </ion-text>
            </ion-item>
            <ion-item lines="full" class="ion-margin-bottom">
               <vue-qrcode :value="'www.modapago.com.ar/'+user.email" v-if="!qrData" :options="{ width: 250 }"  style="margin: auto"/>
               <vue-qrcode :value="qrData" v-else :options="{ width: 250 }"  style="margin: auto"/>
            </ion-item>
            <ion-item lines="none" v-if="!qrData">
               <ion-input :value="amount" v-model="amount" type="text" label="Ingresá el importe a cobrar: " label-placement="stacked" placeholder="0.00" />
            </ion-item>
            <ion-button v-if="!qrData" color="modatex" expand="full" @click="generateQr">Generar codigo qr</ion-button>
            <ion-button v-else color="modapago" expand="full" @click="cleanQr">Generar otro codigo QR</ion-button>
         </ion-content>
      </BasePage>
   </ion-page>
</template>

<style scoped>
ion-content {
   --padding-start : 10px;
   --padding-end : 10px;
   --padding-top: 10px;
   --padding-bottom: 100px
}
</style>