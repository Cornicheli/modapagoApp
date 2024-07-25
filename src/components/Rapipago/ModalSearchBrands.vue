<template>
   <ion-header>
      <ion-toolbar color="modapago" style="padding: 8px">
         <ion-icon slot="start" :icon="arrowBackSharp" style="font-size: 1.6rem; padding:5px 10px" @click="closeModal" />
         <ion-searchbar placeholder="Buscar empresa" :debounce="1300" @ionInput="filterServices($event.target.value)" @ionClear="resetForm" />
      </ion-toolbar>
   </ion-header>
   <ion-content fullscreen color="light">
      <ion-list v-if="!results && !fetching">
         <ion-item lines="none">Sin resultados...</ion-item>
      </ion-list>
      <ion-list v-else-if="results">
         <ion-list-header>Estos son los resultados: </ion-list-header>
         <ion-item v-for="item of results" @click="store.goToSearchForms(item)">
            <IonAvatar slot="start">
               <img :src="`/img/rapipago/logos/logo-rapipagos.png`" style="border-radius: 100%" />
            </IonAvatar>
            <ion-label style="font-size: 0.85rem;" text-wrap>{{ item.name }}</ion-label>
         </ion-item>
      </ion-list>
      <ion-list v-else-if="!results && fetching">
         <ion-list-header>Estos son los resultados: </ion-list-header>
         <ion-item lines="full" v-for="n of 12">
            <skeleton animated />
            <skeleton style="width: 65%;" animated />
         </ion-item>
      </ion-list>
   </ion-content>
</template>
<script setup lang="ts">
import { runAlert } from '@/libs';
import { IonItem, IonList, IonLabel, IonListHeader, IonSearchbar, modalController, IonAvatar } from '@ionic/vue';
import { arrowBackSharp } from 'ionicons/icons';
import { ref } from 'vue';
import useRapipagoStore from '@/store/rapipago';
import { useRouter } from 'vue-router';


const store = useRapipagoStore()
const results = ref<any>()
const fetching = ref(false)
const router = useRouter()

const closeModal = () => modalController.dismiss() 

const resetForm = () => {
   results.value = undefined;
}

const filterServices = async ( str: (string | null | undefined) ) => {

   results.value = undefined;

   if(!str || str.trim() == "")
      return;
   
   if(str.trim().length < 3) 
      return runAlert('Debes ingresar al menos 3 caracteres.')

   fetching.value = true;

   try {
      
      const http = await store.http.post('/company?searchString=' + str, {
         'rapipago_token' : store.authToken
      });

      const response = await http.data;

      results.value = response;      

   } catch (error) {
      
      console.log(error);
      

   } finally {

      fetching.value = false
   }

}



</script>