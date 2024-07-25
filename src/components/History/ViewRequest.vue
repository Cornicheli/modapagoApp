<template>
   <ion-page id="view-request">
      <modal-header title="Detalle de la solicitud" />
      <ion-content fullscreen>
         <IonList lines="full">
            <IonListHeader>
               <h6>Detalle de la cuenta bancaria:</h6>
            </IonListHeader>
            <ion-item>
               <div>
                  <p>Nombre: {{ destination.owner_name }}</p>
                  <p>Banco: {{ destination.bank }}</p>
                  <p>Tipo de cuenta: {{ accountType }}</p>
                  <p>CBU: {{ destination.cbu }}</p>
               </div>
            </ion-item>
            <IonListHeader>
               <h6>Detalle de la operación:</h6>
            </IonListHeader>
            <ion-item>
               <div>
                  <p>Fecha de solicitud: {{ parseDate(operation.created_at) }}</p>
                  <p>Importe: $ {{ operation.amount }}</p>
                  <p>Estado: {{ operationStatus }}</p>
                  <p v-if="operation.payed_at">Fecha de pago: {{ parseDate(operation.payed_at) }}</p>
               </div>
            </ion-item>
         </IonList>
      </ion-content>
   </ion-page>
</template>
<script setup lang="ts">

import { computed, onBeforeMount, ref } from 'vue';
import ModalHeader from '../ModalHeader.vue';
import { IonList, IonListHeader } from '@ionic/vue';
import { parseDate } from '@/libs';

const props = defineProps<{ request: any }>()

const x = ref<number>(0)


const operation = computed( () => props.request )

const operationStatus = computed( () => (operation.value.payed_at) ? 'PAGO' : 'EN PROCESO' )

const destination = computed( () => props.request.accounts[x.value])

const accountType = computed( () => destination.value.account_type == 'cc' ? 'Cuenta corriente' : 'Caja de ahorro' )

const setDefaultBankAccount = () => {
   const request = props.request;
   
   for (let i = 0; i < request.accounts.length - 1; i++) {
      const element = request.accounts[i];
      if(element.id == request.account_id) {
            break;
      }
      x.value ++;
   }
}

onBeforeMount(() => {
   setDefaultBankAccount()
})
</script>