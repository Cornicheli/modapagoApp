<script setup lang="ts">
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonRow, IonText, modalController } from '@ionic/vue';
import ModalHeader from '../ModalHeader.vue';
import { informationCircleSharp } from 'ionicons/icons';

const close = () => modalController.dismiss()
</script>
<template>
   <ModalHeader title="Importante" />
   <IonContent fullscreen>
      <ion-grid id="base-grid">
         <ion-row class="ion-justify-content-center ion-text-center">
            <ion-col size="12" class="ion-padding">
               <IonIcon :icon="informationCircleSharp" style="font-size: 210px;" color="medium" />
               <br>
               <IonItem class="ion-no-padding ion-text-justify" lines="none" style="font-size: 0.9rem; color: #333;">
                  Por normativa del BCRA, te deduciremos una comision en concepto al impuesto a los movimientos digitales:
               </IonItem>
               
               <IonItem lines="full" class="ion-no-padding ion-margin-top">
                  <b slot="start">- Cuentas principales: </b>
                  <span slot="end">0.6%</span>
               </IonItem>
               <IonItem lines="full" class="ion-no-padding">
                  <b slot="start">- Cuentas secundarias: </b>
                  <span slot="end">1.2%</span>
               </IonItem>
               <br>
               <br>
               <ion-button expand="full" color="medium" shape="round" style="--box-shadow: none" @click="close">Aceptar</ion-button>                          
            </ion-col>
         </ion-row>
      </ion-grid>
   </IonContent>
</template>
<style scoped>
ion-grid#base-grid {
   display: flex;
   justify-content: center;
   align-items: center;
   width: 100%;
   height: 80%;
}
ion-label {
   color: #5e5e5e !important
}
</style>