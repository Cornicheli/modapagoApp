<script setup lang="ts">
import ModalHeader from '../ModalHeader.vue';
import { IonList, IonAvatar, onIonViewDidEnter, modalController } from '@ionic/vue';
import { shopImage, notFoundShopImage, parseDate, getData, runAlert, runLoader, axios, runToast } from '@/libs';
import { Filesystem } from '@capacitor/filesystem'
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer';
import { File } from '@awesome-cordova-plugins/file';
import { FileOpener } from '@awesome-cordova-plugins/file-opener'
import { computed, onMounted } from 'vue';
//import usePagofaciStore from '@/store/pagofacil';
import { useRouter } from 'vue-router';

const props = defineProps<{ transacciones: any }>()
//const pagofacilStore = usePagofaciStore()
//const router = useRouter()

const isPendingPaymentFromPagoFacil = computed( () => {
   return ( ( props.transacciones.pagofacil_ticket.status == 'PAGO_PENDIENTE') ? true : false )
})

const descargo = async (transacciones: any) => {   

   
   const loader = await runLoader("Descargando comprobante, aguarde...");


   const fileName = `comprobante_pago_${transacciones.id}.pdf`;

   const url = import.meta.env.VITE_APP_MODAAPI_URL + '/comprobante_rapipago?token=' + localStorage.token + '&transf_id=' + transacciones.id + '&format=pdf';
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

const downloadPagoFacilTicket = async (operationId : string) => {

   const loader = await runLoader("Descargando comprobante, aguarde...");
   const fileName = `comprobante_pagofacil_${operationId}.pdf`;

   const url = `${import.meta.env.VITE_APP_PAGOFACIL_URL}/ticket/${operationId}/download`;
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
/*
const simulatePagofacilPay = async (transaccion: any) => {
   await modalController.dismiss()
   pagofacilStore.ticket = {transaccion : JSON.parse(transaccion)};
   return router.push({ name : 'pagofacil.ticket' })
}*/ 

onMounted( () => {
   console.log("transacciones", props.transacciones);   
})

</script>
<template>
   <div>
      <ModalHeader title="Detalle de la transferencia" />
      <ion-content class="ion-padding" fullscreen>
         <ion-list>
            <ion-item>
               <ion-text>
                  <h4>Generada desde:</h4>
               </ion-text>
            </ion-item>
            <ion-item v-if="transacciones.from.group_name">
               <ion-avatar slot="start">
                  <img :src="shopImage(transacciones.from.group_name)" @error="notFoundShopImage($event)">
               </ion-avatar>
               <ion-label>
                  <ion-text>
                     <p v-text="transacciones.from.group_name"></p>
                  </ion-text>
               </ion-label>
            </ion-item>
            <ion-item v-else>
               <ion-avatar slot="start">
                  <img :src="shopImage(transacciones.from.name)" @error="notFoundShopImage($event)">
               </ion-avatar>
               <ion-label>
                  <ion-text>
                     <p v-text="transacciones.from.name"></p>
                  </ion-text>
               </ion-label>
            </ion-item>
            <ion-item>
               <ion-text>
                  <h4>Negocio Acreditado</h4>
               </ion-text>
            </ion-item>
            <ion-item v-if="transacciones.to.group_name">
               <ion-avatar slot="start">
                  <img :src="shopImage(transacciones.to.group_name)" @error="notFoundShopImage($event)" v-if="!transacciones.pagofacil_operation_id" />
                  <img src="/img/pagofacil.png" v-else />
               </ion-avatar>
               <ion-label text-wrap>
                  <ion-text>
                     <p v-text="transacciones.to.group_name"></p>
                  </ion-text>
               </ion-label>
            </ion-item>
            <ion-item v-else>
               <ion-avatar slot="start">
                  <img :src="shopImage(transacciones.to.name)" @error="notFoundShopImage($event)" v-if="!transacciones.pagofacil_operation_id">
                  <img src="/img/pagofacil.png" v-else />
               </ion-avatar>
               <ion-label>
                  <ion-text>
                     <p v-text="transacciones.to.name"></p>
                  </ion-text>
               </ion-label>
            </ion-item>
            <ion-item>
               <ion-text>
                  <h4>Fecha e Importe</h4>
               </ion-text>
            </ion-item>
            <ion-item>
               <ion-text>
                  <p>Fecha de la operacion: <span v-text="parseDate(transacciones.date)"></span></p>
                  <p>Importe: $ <span
                        v-text="(transacciones.discount_amount == transacciones.amount) ? transacciones.discount_amount : transacciones.amount"></span>
                  </p>
                  <p>Comentario: <span v-text="transacciones.description"></span> </p>
               </ion-text>
            </ion-item>
            <ion-item lines="full" v-if="transacciones.rapipago_operation_id != null">
               <ion-button @click="descargo(transacciones)" color="modatex"
                  style="width: 100%; --height: auto; --padding-top: 1.5em; --padding-bottom: 1.5em;">Descargar comprobante</ion-button>
            </ion-item>
            <div v-if="transacciones.pagofacil_operation_id != null" class="ion-margin-top">
               <ion-button @click="downloadPagoFacilTicket(transacciones.pagofacil_operation_id)" color="modatex" expand="block" :disabled="isPendingPaymentFromPagoFacil">
                  Descargar comprobante
               </ion-button>
               <!--ion-button @click="simulatePagofacilPay(transacciones.pagofacil_ticket.ticket)" color="modatex" expand="block">
                  Descarga en confirmacion de pago
               </ion-button-->
            </div>            
         </ion-list>
   </ion-content>
</div></template>