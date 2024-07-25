<template>
   <ion-page>
      <base-page>
         <ion-content fullscreen class="secondary">
            <ion-grid class="rapi-section bg-white">
               <ion-row>
                  <ion-col size="12">
                     <div class="ion-text-center">
                        <ion-title>Busqueda por barras</ion-title>                                    
                        <small>Selección de proveedor</small>
                     </div>
                  </ion-col>
               </ion-row>
            </ion-grid>
            <ion-grid>
               <ion-row>
                  <ion-col size="12">                 
                     <ion-list>
                           <ion-title class="ion-text-center">Elegí tu empresa</ion-title>
                           <ion-item lines="full" v-for="barra of barras" :key="barra.id">
                              <div style="width: 100%">
                              <ion-button color="medium" expand="block" @click="buscarFacturaxBarraxId(barra)">
                                 {{ barra.companyName }}
                              </ion-button>                            
                              </div>
                           </ion-item>
                     </ion-list>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </base-page>
   </ion-page>
</template>
<script setup lang="ts">
import { IonList, IonItem, IonTitle } from '@ionic/vue'
import { computed } from 'vue';
import { useRouter } from 'vue-router'
import useRapipagoStore from '@/store/rapipago';
import BasePage from '@/components/BasePage.vue';

const store = useRapipagoStore()
const router = useRouter();


const barras = computed(() => {
   return JSON.parse(localStorage.rapiBarrasEncontradas);
});

const buscarFacturaxBarraxId = ( servicio: any) => {
   localStorage.rapiVencimientos = JSON.stringify({ 0 : servicio });
   router.push({name : 'app.rapipago.invoices', params : {
      companyId : store.serviceId,
      companyName : encodeURI(store.serviceName)
   }});
}

</script>