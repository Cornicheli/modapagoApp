<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import appStore from '@/store/app'
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { IonAlert, IonButton, IonCol, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonRow, IonSpinner, IonText, modalController, onIonViewWillEnter } from '@ionic/vue';
import { ban, chevronDown, informationCircle, informationCircleOutline, informationCircleSharp } from 'ionicons/icons';
import ExtractionInfo from '@/components/MoneyRequest/ExtractionInfo.vue';
import ExtractionInfoFees from '@/components/MoneyRequest/ExtractionInfoFees.vue';
import { runToast, axios } from '@/libs';
import BankAccounts from '@/components/MoneyRequest/BankAccounts.vue';
import { useRouter } from 'vue-router';
import ExtractionSuccess from '@/components/MoneyRequest/ExtractionSuccess.vue';

const router = useRouter()

const fetching = ref(true)
const app = appStore()
const { inAccount, available, toRelease } = storeToRefs(app)

const freeExtractions = ref<number>(0)
const extractionFee = computed( () => (freeExtractions.value == 0) ? 30 : 0 )
const bankAccounts = ref()

const tax = computed( () => {
   if(form.bank) {
      if(form.bank.is_main) {
         return ( form.amount * (0.6 / 100) );
      } else {
         return ( form.amount * (1.2 / 100) );
      }
   }
   return 0
})
const subtotal = computed( () => (Number(form.amount) + Number(tax.value) + Number(extractionFee.value)) )

const form = reactive<{
   amount : any,
   bank : any
}>({
   amount : 100,
   bank : null
})

const balanceItems = computed( () => {
   return [
      { caption : 'En cuenta', value : inAccount.value, color: 'modapago' },
      { caption : 'Disponible', value : available.value, color: 'success' },
      { caption : 'A liberar', value : toRelease.value, color: 'warning' },
   ]
})

const getBalance =  async () => {
   
   try {
      fetching.value = true   
      await app.getBalance(true)
   } catch (error) {
      console.log(error);      
   } finally {
      fetching.value = false
   }
}

const extractionsInfo = async () => {
   const modal = await modalController.create({
      component : ExtractionInfo
   })
   await modal.present()
}

const subtotalInfo = async () => {
   const modal = await modalController.create({
      component : ExtractionInfoFees      
   })
   await modal.present()
}

const fetchBankAccounts = async () => {

   fetching.value = true

   try {

      const response = await axios.get('/request/accounts')
      const {items, free_extractions}  = await response.data

      freeExtractions.value = free_extractions
      bankAccounts.value = items
   } catch (error) {

      await runToast('No pudimos traer tus cuentas bancarias, intenta nuevamente mas tarde.')

   } finally {

      fetching.value = false
   }
}

const isAccountsModalOpen = ref(false)

const toggleModal = (value : boolean) => {
   isAccountsModalOpen.value = value
}

const selectBank = (bank: any) => {
   toggleModal(false)
   form.bank = bank
}

/**
 * Proceso de efectivización de solicitud
 */

const showRequestSuccessModal = ref(false)

const processRequest = async () => {

   try {

      if(!form.bank) {
         throw new Error("Seleccione la cuenta destino.")
      }

      if(form.amount < 100) {
         throw new Error("El monto ingresado debe ser mayor o igual a $100.")
      }

      if(subtotal.value > Number(available.value.join('.'))) {
         throw new Error("No posees suficiente saldo disponible para realizar esta operación.")
      }

      fetching.value = true

      const response = await axios.post('/request/process', {
         bank : form.bank.id,
         amount : form.amount
      })

      const data = await response.data

      if(data.status == 'success') {
         showRequestSuccessModal.value = true
      }

      if(data.error)
         throw new Error(data.error);
         
      
   } catch (error) {
      
      await runToast(String(error));
   
   } finally {

      await getBalance()
      await fetchBankAccounts()

      form.bank = null
      fetching.value = false
   }
}


const closePage = async () => {
   showRequestSuccessModal.value = false
   await router.push({ name : 'app.home' })
}

onIonViewWillEnter( async () => { 
   await getBalance() 
   await fetchBankAccounts()
})

</script>
<style scoped>
h2 { position: relative; }
</style>
<template>
   <ion-page>
      <BasePage>
         <ion-content color="light" fullscreen>
            <template v-if="!fetching">
               <IonGrid class="bg-white ion-padding-top">               
                  <IonRow v-for="item of balanceItems" class="ion-align-items-center ion-justify-content-between" style="padding: 8px 0;">
                     <IonCol size="6">{{ item.caption }}</IonCol>
                     <IonCol size="6" class="ion-text-end">
                        <IonText :color="item.color">
                           <h4>
                              $ {{ item.value.join('.') }}
                           </h4>
                        </IonText>
                     </IonCol>
                  </IonRow>
               </IonGrid>
               <IonList class="ion-margin-top ion-no-padding" style="padding: 10px;">                                  
                  <ion-item button lines="none" class="ion-no-margin ion-no-padding" @click="extractionsInfo">                     
                     <ion-icon :icon="informationCircleOutline" style="margin: 2px 6px;" />
                     <ion-text>
                        <strong>{{ freeExtractions }} </strong> retiros gratuitos restantes
                     </ion-text>                     
                  </ion-item>
                  <IonItem lines="full" class="ion-no-padding">
                     <IonInput type="number" v-model="form.amount" label="Monto a extraer: *" label-placement="floating" color="modapago" />
                  </IonItem>
                  <IonItem button lines="full" class="ion-no-padding" detail :detail-icon="chevronDown" @click="toggleModal(true)">
                     <IonLabel v-if="!form.bank">Cuenta destino: *</IonLabel>
                     <div v-else>
                        <div>
                           <small>Cuenta destino: *</small>
                           <div style="margin-top: 5px;">{{ form.bank.owner_name }}</div>
                        </div>
                     </div>
                  </IonItem> 
                  
                  <ion-item class="ion-no-padding ion-margin-top" lines="none" style="font-size: 0.8rem; --min-height: 20px">
                     <span slot="start">Monto a extraer: </span>
                     <ion-label class="ion-margin-start" slot="end">${{ form.amount }}</ion-label>
                  </ion-item>
                  <ion-item class="ion-no-padding" lines="none" style="font-size: 0.8rem; --min-height: 20px">
                     <span slot="start">Comisión por extracción: </span>
                     <ion-label class="ion-margin-start" slot="end">${{ extractionFee }}</ion-label>
                  </ion-item>
                  <ion-item button class="ion-no-padding" lines="full" style="font-size: 0.8rem; --min-height: 20px" @click="subtotalInfo">                     
                     <span>                        
                        Impuesto credito/debito: 
                        <ion-icon :icon="informationCircleOutline"/>
                     </span>
                     <ion-label class="ion-margin-start" slot="end">{{ tax }}%</ion-label>
                  </ion-item>
                  <ion-item class="ion-no-padding" lines="none" style="font-size: 0.8rem; --min-height: 20px; font-weight: bold;"> 
                     <span slot="start">Subtotal: </span>
                     <ion-label class="ion-margin-start" slot="end">${{ subtotal }}</ion-label>
                  </ion-item>                  

                  <!-- Boton de confirmacion de extraccion -->

                  <IonButton color="modatex" expand="block" class="ion-margin-vertical" @click="processRequest" :disabled="!form.bank || form.amount < 100">Continuar</IonButton>
                  
                  <!-- /Boton de confirmacion de extraccion -->
                                                   
               </IonList>
            </template>
            <template v-else>
               <IonSpinner name="crescent" class="app-loader" color="modatex"/>
            </template>
         </ion-content>
         <ion-modal :is-open="isAccountsModalOpen" @didDismiss="toggleModal(false)">
            <BankAccounts :accounts="bankAccounts" @select-bank="selectBank" />
         </ion-modal>
         <ion-modal :is-open="showRequestSuccessModal" @willDismiss="closePage">
            <ExtractionSuccess />
         </ion-modal>
      </BasePage>
   </ion-page>
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
.form-title { border-bottom: 1px solid #ccc; padding-bottom: 5px; font-weight: bold; }
</style>