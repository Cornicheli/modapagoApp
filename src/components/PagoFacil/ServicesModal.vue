<script setup lang="ts">
import { axios, runAlert, runToast } from '@/libs';
import usePagofaciStore from '@/store/pagofacil';
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { modalController, IonSearchbar, IonHeader, IonToolbar, IonButton, IonContent } from '@ionic/vue';
import { isAxiosError } from 'axios';
import { onBeforeMount, ref } from 'vue';

const props = defineProps<{
   category : string|null
}>()

const fetching = ref(false)
const results = ref()
const store = usePagofaciStore()

const closeModal = () => modalController.dismiss()

const fetchItemsFromCategory = async () => {
   
   try {
      
      fetching.value = true

      const resp = await axios.get(import.meta.env.VITE_APP_PAGOFACIL_URL + '/company/search?group=' + props.category)
      const data = await resp.data;

      results.value = data;
      

   } catch (error) {

      if (isAxiosError(error)) {
         
         await runAlert(error.response?.data.message);
      }

      await runAlert(String(error))
      
   } finally { 

      fetching.value = false
   }
}

const filterItems = async ( param : any ) => {

   const query = String(param.target.value);

   if(query.trim().length < 3)
      return await runToast('Debe ingresar al menos 3 caracteres.');

   try {
      
      fetching.value = true

      let url = import.meta.env.VITE_APP_PAGOFACIL_URL + '/company/search?company=' + query;
      
      if(props.category)
         url += '&group=' + props.category;

      const resp = await axios.get(url)
      const data = await resp.data;

      results.value = data;
      

   } catch (error) {

      if (isAxiosError(error)) {
         
         await runAlert(error.response?.data.message);
      }

      await runAlert(String(error))
      
   } finally { 

      fetching.value = false
   }   
}

const resetModal = () => {
   results.value = undefined;
}

onBeforeMount( async () => {
   if(props.category)
      await fetchItemsFromCategory()
})

</script>
<template>
      <ion-header>
         <ion-toolbar color="modapago" style="padding: 5px;">
            <ion-button color="light" fill="clear" class="ion-no-padding" slot="start" style="margin-top: 0px;" @click="closeModal">
               <fa-icon :icon="faClose" class="fa-2xl" />
            </ion-button>
            <ion-searchbar placeholder="Buscar empresa..." :debounce="1000" @ion-clear="resetModal()" @ion-input="filterItems($event)" />
         </ion-toolbar>
      </ion-header>
      <ion-content fullscreen color="light">
         <ion-grid class="ion-margin-top" v-if="fetching">
            <ion-row v-for="n of 12">
               <ion-col size="12">
                  <skeleton animated style="width: 100%; height: 30px;"/>
               </ion-col>
            </ion-row>
         </ion-grid>
         <ion-list v-else-if="!fetching && results" class="ion-no-padding">
            <ion-item lines="full" v-for="item of results.rows" button @click="store.findInvoicePage(item, true)">
               <ion-img src="/img/pagofacil.png" style="width: 50px;" />
               <ion-label>{{ item.company_name }}</ion-label> 
            </ion-item>            
            <p class="ion-text-center">{{ results.total }} resultado(s).</p>            
         </ion-list>
      </ion-content>
</template>