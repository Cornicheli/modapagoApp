<template>
   <ion-page id="vue-rapipago-app-comprobante">
      <base-page>
         <ion-content class="secondary" fullscreen>
            <ion-item lines="full">
               <ion-grid>
                  <ion-row>
                     <ion-col size="12">
                        <div class="ion-text-center">
                           <ion-title>Comprobante de pago</ion-title>
                           <small>N°: {{ nTicket }}</small>
                        </div>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </ion-item>
            <br>
            <ion-grid class="bg-white rapi-section">
               <ion-row>
                  <ion-col size="12">
                     <div
                        style="border: 0.12em dashed #333; border-radius: 0.39em; padding: 12px; padding-left: 15px; padding-right: 15px">
                        <div class="rapi-section ion-text-center">
                           <b>Ticket de pago</b>
                        </div>
                        <br>
                        <div class="ion-text-center" style="margin: 0.6em auto;">
                           <span> *** AGENTE OFICIAL RAPIPAGO ***</span>
                        </div>
                        <div v-for="(dato, i) of ticket" :key="i" style="white-space: normal; margin: 1em auto">
                           <div class="ion-text-center" v-if="i == (ticket.length - 1)">
                              {{ dato }}
                           </div>
                           <div v-else>
                              {{ dato }}
                           </div>
                        </div>
                        <div class="rapi-section"></div>
                        <br>
                        <div class="ion-text-center">
                           <ion-img src="/img/rapipago/logo.png" style="width: 150px; align-items: center; margin:auto;"
                              class="ion-text-center" />
                        </div>
                     </div>
                     <br>
                     <div class="ion-text-center">
                        <ion-button color="modatex" class="ion-text-center" @click="descargo(nTicket)">Descargar
                           comprobante</ion-button>
                     </div>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </base-page>
   </ion-page>
</template>
 
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonImg } from '@ionic/vue';
import { getData, runAlert, runLoader, runToast } from '@/libs';
import { Filesystem } from '@capacitor/filesystem'
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer';
import { File } from '@awesome-cordova-plugins/file';
import { FileOpener } from '@awesome-cordova-plugins/file-opener';
import BasePage from '@/components/BasePage.vue';

const router = useRouter()
const route = useRoute()

const nTicket = computed(() => {
   return route.params.transferenceId;
});

const ticket = computed(() => {
   let ticket = JSON.parse(localStorage.rapiTicket);
   return ticket;
})


const descargo = async (transferenceId : any) => {   

   const loader = await runLoader("Descargando comprobante, aguarde...");


   const fileName = `comprobante_pago_${transferenceId}.pdf`;

   const url = import.meta.env.VITE_APP_MODAAPI_URL + '/comprobante_rapipago?token=' + getData('token') + '&transf_id=' + transferenceId + '&format=pdf';
   const dest = File.dataDirectory + fileName;

   await Filesystem.requestPermissions();

   FileTransfer.create().download(url, dest ).then(async (entry) => {      

      runToast("Descarga exitosa");

      await FileOpener.open(entry.nativeURL, 'application/pdf');

   }, (error) => {

      runAlert( String(JSON.stringify(error.exception)) )

   })
   .finally( () => {

      loader.dismiss();
   });
}
</script>
 
<style></style>