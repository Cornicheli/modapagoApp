<script setup lang="ts">
import ModatexTransferenceForm from '@/components/ModatexTransferenceForm.vue';
import { 
   IonButton, 
   IonCol, 
   IonContent, 
   IonGrid, 
   IonImg, 
   IonInput, 
   IonItem, 
   IonLabel, 
   IonList, 
   IonListHeader, 
   IonRow, 
   IonTextarea,
   IonText, 
   IonIcon,
   IonSpinner,
   IonModal,
modalController,
} from '@ionic/vue';

import { computed, onMounted, reactive, ref } from 'vue';
import { arrowForward, checkmarkCircleSharp } from 'ionicons/icons';
import { axios, runToast } from '@/libs';
import ModalHeader from './ModalHeader.vue';
import appStore from '@/store/app';
import { useRouter } from 'vue-router';

const router = useRouter()
const store = appStore()
const fetching = ref(true)

const flagTransfer = reactive({
   sending: false,
   sent: false
})

const form = reactive({
   amount : '',
   description : ''
})

const available = computed( () => {
   const data = store.available
   return "$ " + data.join('.')
})

const payModatex = async () => {
   const available = store.available.join('.');

   if(!form.amount || Number(form.amount) < 10) 
      return await runToast('Ingrese un número mayor a $10.')

   if(Number(form.amount) > Number(available)) 
      return await runToast('El monto ingresado supera el saldo disponible.')

   flagTransfer.sending = true
   
   try {

      await axios.post('/modatex/transference', form)
      flagTransfer.sent = true

   } catch (error) {

      await runToast("Hubo un error al realizar el pago, intenta nuevamente.")
      flagTransfer.sent = false

   } finally {

      flagTransfer.sending = false
   }

}  

const resetModals = async () => {
   flagTransfer.sent = false
   flagTransfer.sending = false   
   await modalController.dismiss()
}

const openModatexTransferenceForm = async () => {
   const form = await modalController.create({
      component: ModatexTransferenceForm
   });
   form.present()
}

onMounted(async () => {
   await store.getBalance()
   fetching.value = false
})

</script>
<template>
   <ModalHeader title="Transferir a Modatex" />
   <IonContent fullscreen>
      <template v-if="!flagTransfer.sending && !flagTransfer.sent">
         <IonList class="ion-no-padding">
            <IonListHeader lines="full">
               <IonGrid>
                  <IonRow class="ion-padding-vertical">
                     <ion-col size="12" class="ion-text-center">
                        <ion-text>Dinero disponible</ion-text>
                     </ion-col>
                     <ion-col size="12" class="ion-text-center">
                        <h2 style="color: var(--ion-color-success)" v-if="!fetching">{{ available }}</h2>
                        <h2 v-else>
                           <skeleton animated />
                        </h2>
                     </ion-col>
                  </IonRow>
               </IonGrid>
            </IonListHeader>
            <IonItem lines="full">
               <IonImg src="/img/icon-moda-app.png" style="width: 50px; height: 50px; margin-right: 5px;" />
               <IonLabel>Modatex</IonLabel>
            </IonItem>
            <IonItem lines="full">
               <IonInput v-model="form.amount" type="number" placeholder="$ 100" label="Cantidad a transferir: *" label-placement="stacked" />
            </IonItem>
            <IonItem lines="full">
               <IonTextarea v-model="form.description" label="Comentarios (opcional): " label-placement="stacked" placeholder="Ej.: Pago por prestación de servicios." :rows="4" />
            </IonItem>        
         </IonList>
         <IonGrid class="">
            <IonRow>
               <IonCol size="10" offset="1">
                  <IonButton color="modapago" expand="block" size="default" :disabled="fetching" @click="payModatex">
                     <IonLabel style="margin-right: 10px;">Transferir</IonLabel>
                     <IonIcon :icon="arrowForward" />
                  </IonButton>
               </IonCol>
            </IonRow>
         </IonGrid>
      </template>
      <template v-else-if="flagTransfer.sending && !flagTransfer.sent">
         <IonSpinner name="crescent" class="app-loader" color="modatex"/>
      </template>
      <ion-grid v-if="flagTransfer.sent">
         <ion-row class="ion-justify-content-center ion-text-center">
            <ion-col size="12" class="ion-padding">
               <IonIcon :icon="checkmarkCircleSharp" style="font-size: 180px;" color="success" />
               <br>
               <br>
               <IonLabel style="font-size: 1rem;" color="medium">
                  Recibimos tu pago ¡Muchas gracias!
               </IonLabel> 
               <br><br>
               <ion-button expand="full" color="success" shape="round" style="--box-shadow: none" @click="resetModals()">Aceptar</ion-button>                          
            </ion-col>
         </ion-row>
      </ion-grid>
   </IonContent>
</template>
<style scoped>
.app-loader {
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   width: 50px;
   height: 50px;
   margin: auto;
}
</style>