<script setup lang="ts">
import { axios, runAlert } from '@/libs';
import { faBarcode, faMagnifyingGlass, faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { onBeforeMount, ref } from 'vue';
import { modalController, onIonViewDidEnter, onIonViewWillEnter, useBackButton, useIonRouter } from '@ionic/vue';
import ServicesModal from '@/components/PagoFacil/ServicesModal.vue';
import { isAxiosError } from 'axios';
import usePagofaciStore from '@/store/pagofacil';
import { arrowBackSharp } from 'ionicons/icons';
import appStore from '@/store/app';

const fetchingHome = ref(true)
const homeItems = ref();
const store = usePagofaciStore()
const globalStore = appStore()
const ionRouter = useIonRouter()

const openServicesModal = async (category: null|string = null) => {
   const modal = await modalController.create({
      component : ServicesModal,
      componentProps : {
         category: category
      }
   });

   modal.present();
}

const getTrendingCompanies = async () => {
   
   try {

      fetchingHome.value = true

      const response = await axios.get(import.meta.env.VITE_APP_PAGOFACIL_URL + '/company/trending');
      const data = await response.data;

      homeItems.value = data;
      
      
   } catch (error) {

      if (isAxiosError(error)) {
         
         await runAlert(error.response?.data.message);
      }

      await runAlert(String(error))  
          
   } finally {

      fetchingHome.value = false;
   }
}

onIonViewDidEnter ( async () => {
   await getTrendingCompanies()
})

</script>
<style scoped>
.btn-action {
   width: 70px; height: 70px;
}
</style>
<template>
   <ion-page>
      <ion-content v-if="!store.isScannerOpen" fullscreen color="light">
         <ion-grid class="ion-align-items-center ion-text-center bg-white ion-padding-vertical">
            <ion-row> 
               <ion-col size="4">
                  <ion-button shape="round" class="btn-action" color="modapago" @click="store.startScan">
                     <fa-icon :icon="faBarcode"  class="fa-2x" />
                  </ion-button>
                  <div style="margin: 10px 0 5px;">Escanear factura</div>
               </ion-col>
               <ion-col size="4">
                  <ion-button shape="round" class="btn-action" color="modapago" @click="openServicesModal()">
                     <fa-icon :icon="faMagnifyingGlass" class="fa-2x" />
                  </ion-button>
                  <div style="margin: 10px 0 5px;">Buscar servicios</div>
               </ion-col>
               <ion-col size="4">
                  <ion-button shape="round" class="btn-action" color="modapago" :router-link="{ name: 'app.history' }">
                     <fa-icon :icon="faClipboardList" class="fa-2x" />
                  </ion-button>
                  <div style="margin: 10px 0 5px;">Ultimos movimientos</div>
               </ion-col>
            </ion-row>
         </ion-grid>

         <ion-grid v-if="fetchingHome">
            <ion-row class="ion-margin-top bg-white ion-padding">
               <ion-col size="12">
                  <skeleton animated style="width: 100%; height: 20px;" />
               </ion-col>
               <ion-col size="6">
                  <skeleton animated style="width: 100%; height: 80px;" />
               </ion-col>
               <ion-col size="6">
                  <skeleton animated style="width: 100%; height: 80px;" />
               </ion-col>
               <ion-col size="6">
                  <skeleton animated style="width: 100%; height: 80px;" />
               </ion-col>
               <ion-col size="6">
                  <skeleton animated style="width: 100%; height: 80px;" />
               </ion-col>
            </ion-row>

            <ion-row v-for="n of 3" class="ion-margin-top bg-white ion-padding">
               <ion-col size="12" v-for="n of 4">
                  <skeleton animated style="width: 100%; height: 40px;" />
               </ion-col>
            </ion-row>
         </ion-grid>


         <ion-grid v-else>
            <ion-row class="ion-margin-top bg-white ion-padding">
               <ion-col size="12" class="ion-text-center">
                  <b style="font-size: 1.2rem;">Servicios destacados</b>
               </ion-col>
               <ion-col size="6" v-for="item of homeItems.most_used">
                  <ion-button color="light" style="height: auto;" expand="block" @click="store.findInvoicePage(item)">
                     <div style="width: 100%; margin-top: 10px;">
                        <ion-img src="/img/pagofacil.png" alt="pagofacil" style="width: 80px; margin: auto;" />
                        <p>{{ item.company_name }}</p>
                     </div>
                  </ion-button>
               </ion-col>
            </ion-row>
            <ion-row class="ion-margin-top bg-white ion-padding" v-for="refs of homeItems.groups">
               <ion-col size="12" class="ion-text-start">
                  <b style="font-size: 1rem; margin-bottom: 10px; display: block;">{{ refs.category }}</b>
                  <ion-item button lines="full" v-for="item of refs.items" class="ion-no-padding" style="margin: 5px 0" @click="store.findInvoicePage(item)">
                     <ion-img src="/img/pagofacil.png" alt="pagofacil" style="width: 50px;" /> 
                     <ion-label>{{ item.company_name }}</ion-label>
                  </ion-item>
                  <ion-button color="primary" fill="clear" expand="block" style="margin-top: 10px;" @click="openServicesModal(refs.category)">
                     Ver todo ({{ refs.total_items }})
                  </ion-button>
               </ion-col>
            </ion-row>
         </ion-grid>

      </ion-content>
      <ion-content fullscreen style="position:relative; --background: transparent;" v-else>
         <ion-button color="light" fill="outline" class="cancelScan" @click="store.stopScan">
            <ion-icon :icon="arrowBackSharp" style="margin-right: 10px;"></ion-icon>
            Volver
         </ion-button>
         <div class="scanOverlayCustom"></div>
      </ion-content>
   </ion-page>
</template>