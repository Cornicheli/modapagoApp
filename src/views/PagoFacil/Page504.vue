<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import { faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/vue';

</script>
<template>
   <ion-page>
      <BasePage>
         <ion-content fullscreen color="light">
            <ion-header>
               <ion-toolbar>
                  <ion-title class="ion-text-center">Aviso de Modapago</ion-title>
               </ion-toolbar>
            </ion-header>

            <ion-card>
               <ion-card-header color="modapago">
                  <ion-card-title class="ion-text-center">                     
                     <ion-text>Pago pendiente</ion-text>
                  </ion-card-title>                  
               </ion-card-header>
               <ion-card-content class="ion-margin-top"> 
                  <p>Nos encontramos procesando tu pago, este proceso puede llevar hasta 2 horas.</p>
                  <br>
                  <p>Desde <b>movimientos</b>, vas a poder ver tu pago en estado <b>pendiente</b>.</p>
                  <br>
                  <p>En el caso de que tu pago sea rechazado/cancelado, se anulará la transferencia en estado pendiente y tu dinero volverá a tu balance.</p>
                  <br>
                  <ion-button color="modapago" expand="block" :router-link="{name:'pagofacil'}">Entendido</ion-button>
               </ion-card-content>
            </ion-card>
         </ion-content>
      </BasePage>      
   </ion-page>
</template>