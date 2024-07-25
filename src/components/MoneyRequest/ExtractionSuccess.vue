<script setup lang="ts">
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonLabel, IonRow, modalController } from '@ionic/vue';
import ModalHeader from '../ModalHeader.vue';
import { checkmarkCircleSharp, informationCircleSharp } from 'ionicons/icons';

const close = async () => await modalController.dismiss()

</script>
<template>
   <ModalHeader title="Importante" />
   <IonContent fullscreen>
      <ion-grid>
         <ion-row class="ion-justify-content-center ion-text-center">
            <ion-col size="12" class="ion-padding">
               <IonIcon :icon="checkmarkCircleSharp" style="font-size: 180px;" color="success" />
               <br>
               <br>
               <IonLabel style="font-size: 0.9rem;" color="success">
                  <p>¡Transacción realizada con éxito!</p> 
                  <p>En las próximas 48 hs verás acreditada tu transferencia.</p>
               </IonLabel> 
               <br><br>
               <ion-button expand="full" color="success" shape="round" style="--box-shadow: none" @click="close">Aceptar</ion-button>                          
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