<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import usePagofaciStore from '@/store/pagofacil';
import { IonImg, IonItemDivider, onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { Filesystem } from '@capacitor/filesystem'
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer';
import { File } from '@awesome-cordova-plugins/file';

import { FileOpener } from '@awesome-cordova-plugins/file-opener'
import { getData, runAlert, runLoader, runToast } from '@/libs';

const router = useRouter()
const store = usePagofaciStore()


const downloadPagoFacilTicket = async (operationId : string) => {

   const loader = await runLoader("Descargando comprobante, aguarde...");
   const fileName = `comprobante_pagofacil_${operationId}.pdf`;

   const url = `${import.meta.env.VITE_APP_PAGOFACIL_URL}/ticket/${operationId}/download`;   

   console.log('descargando desde >>> ', url);
   

   const dest = File.dataDirectory + fileName;

   await Filesystem.requestPermissions();

   FileTransfer.create().download(url, dest ).then(async (entry) => {      

      runToast("Descarga exitosa");

      await FileOpener.open(entry.nativeURL, 'application/pdf');

   }, (error) => {

      runAlert( String(JSON.stringify(error)) )

   })
   .finally( () => {

      loader.dismiss();
   });

}

onIonViewWillEnter( async () => {
   if (!store.ticket) {
      return router.replace({ name : 'pagofacil' })
   }
})

onIonViewWillLeave( async () => {
   store.company = undefined
   store.invoice = undefined
   store.ticket  = undefined
})
</script>
<template>
   <ion-page>
      <BasePage>
         <ion-content v-if="store.ticket" fullscreen color="light">
            <ion-header>
               <ion-toolbar>
                  <ion-title class="ion-text-center">Comprobante de pago</ion-title>
               </ion-toolbar>
            </ion-header>

            <ion-grid class="ion-margin-top bg-white ion-margin ion-padding" style="border: 1px solid #333">
               <ion-row class="ion-align-items-center">
                  <ion-col size="3">
                     <IonImg src="/img/pagofacil.png" />
                  </ion-col>
                  <ion-col size="4">
                     <IonImg src="/img/pagospymes.jpg" />
                  </ion-col>
                  <ion-col size="5">
                     <IonImg src="/img/logo-modapago-all.png" />
                  </ion-col>
               </ion-row>
               <IonItemDivider></IonItemDivider>
               <ion-row>
                  <ion-col size="12">
                     <pre style="white-space: pre-line; font-size: 0.9rem;">
                        {{ store.ticket.transaccion.comprobante }}
                     </pre>
                  </ion-col>
               </ion-row>               
               <ion-row>
                  <ion-col size="12">
                     <ion-button expand="block" color="modatex" @click="downloadPagoFacilTicket(store.ticket.transaccion.idTransaccion)">Descargar</ion-button>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </BasePage>
   </ion-page>
</template>