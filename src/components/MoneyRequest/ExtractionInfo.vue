<script setup lang="ts">
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonLabel, IonRow, modalController } from '@ionic/vue';
import ModalHeader from '../ModalHeader.vue';
import { informationCircleSharp } from 'ionicons/icons';

const close = () => modalController.dismiss()

</script>
<template>
   <ModalHeader title="Importante" />
   <IonContent fullscreen>
      <ion-grid>
         <ion-row class="ion-justify-content-center ion-text-center">
            <ion-col size="12" class="ion-padding">
               <IonIcon :icon="informationCircleSharp" style="font-size: 180px;" color="medium" />
               <br>
               <br>
               <IonLabel style="font-size: 0.9rem;" color="dark">
                  Tenés 2 extracciones sin cargo por mes. <br>
                  Luego se te cobrará $30 por extracción.
               </IonLabel> 
               <br><br>
               <ion-button expand="full" color="medium" shape="round" style="--box-shadow: none" @click="close">Aceptar</ion-button>                          
            </ion-col>
         </ion-row>
      </ion-grid>
   </IonContent>
</template>
<style scoped>
ion-grid {
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