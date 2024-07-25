<script setup lang="ts">
import { IonContent, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonText, IonToolbar, SearchbarCustomEvent } from '@ionic/vue';
import ModalHeader from '../ModalHeader.vue';
import { ref } from 'vue';

interface AccountInfo { 
   is_main : boolean,
   account_type   : string,
   bank           : string,
   cbu            : string,
   owner_name     : string,
   account_number : string
}

const props = defineProps<{ accounts : AccountInfo[] }>()
const filteredItems = ref<AccountInfo[]>([...props.accounts]);
const selectedBank = ref<AccountInfo>()

const emit = defineEmits(['selectBank'])

const selectBank = ( bank : AccountInfo ) => {
   selectedBank.value = bank
   emit('selectBank', bank)
}

const searchbarInput = (ev: SearchbarCustomEvent) => {
   filterList(String(ev.target.value));
};

const filterList = (searchQuery: string | undefined) => {
   if (searchQuery === undefined) {
      filteredItems.value = [...props.accounts];
   } else {

      const normalizedQuery = searchQuery.toLowerCase();
      filteredItems.value = props.accounts.filter((item) => {
         return (
            item.bank.toLowerCase().includes(normalizedQuery) || 
            item.owner_name.toLowerCase().includes(normalizedQuery) ||
            item.cbu.toLowerCase().includes(normalizedQuery)
         );
      });
   }
};

</script>
<template>
   <ModalHeader title="Tus cuentas"/>
   <IonToolbar color="modapago" style="padding: 8px">
      <IonSearchbar placeholder="Buscar x CBU / Banco / Dueño" @ionInput="searchbarInput($event)" />
   </IonToolbar>
   <IonContent fullscreen color="light">
      <IonList>
         <IonListHeader lines="full">
            <strong>Listado</strong>
         </IonListHeader>
         <IonItem 
            button 
            lines="full" 
            v-for="account of filteredItems" 
            @click="selectBank(account)"
            style="--min-height: auto; --padding-top: 8px; --padding-bottom: 8px">
            <div>
               <IonLabel style="font-size: 0.9rem; padding-bottom: 5px;">{{ account.owner_name  }}</IonLabel>
               <IonLabel style="font-size: 0.8rem; padding-bottom: 5px;" :color=" (account.is_main) ? 'success' : 'danger'">                  
                  <b v-if="account.is_main">Cuenta principal</b>
                  <b v-else>Cuenta secundaria</b>
               </IonLabel>
               <IonLabel style="font-size: 0.8rem;">
                  <b>Banco: </b>
                  <IonText>{{ account.bank }}</IonText>
               </IonLabel>
               <IonLabel style="font-size: 0.8rem;">
                  <b>Cuenta: </b>
                  <IonText>{{ (account.account_type == 'cc') ? 'Cuenta corriente' : 'Caja de ahorro' }}</IonText>
               </IonLabel>
               <IonLabel style="font-size: 0.8rem;">
                  <b>Cbu: </b>
                  <IonText>{{ account.cbu }}</IonText>
               </IonLabel>               
            </div>
         </IonItem>
      </IonList>
   </IonContent>
</template>