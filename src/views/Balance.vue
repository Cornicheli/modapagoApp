<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import HistoryGrid from '@/components/HistoryGrid.vue';
import { axios, getData, runToast } from '@/libs';
import appStore from '@/store/app'
import { isAxiosError } from 'axios';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue';
import { Browser } from '@capacitor/browser';


const app = appStore()

const { inAccount, available, toRelease, user } = storeToRefs(app)
const results = ref([])

const fetchingHistory = ref(false)

const historyBody = reactive({    
   token: getData('token'),
   start: 0,
   _start: moment(Date.now()).subtract(7, 'days').format('DD/MM/YYYY'),
   _end: moment(Date.now()).format('DD/MM/YYYY'),
   lenght: 5,            
   _brand: getData('user').owner.id,
   status: 'all', //eslint-disable-line
   order: 'payment', //eslint-disable-line
   type: 'all'
})

const _count = ref<number>(0)
const historyItems = ref()

const loadBalance = async () => {
   if(!results.value.length) {      
      await app.getBalance(true)
   }
}

const fetchCurrentHistory = async () => {

   fetchingHistory.value = true

   try {

      const http = await axios.get('/movimientos', {
         params: historyBody,
         timeout:10000
      });

      const response = await http.data
      
      console.log('historial > ', response);

      if(!response.message) {
         _count.value = response.count;
         historyItems.value = (response.count > 0 ) ? Object.keys(response.coupons).map(i => response.coupons[i]) : []      
      }
      
   } catch (error) {

      if (isAxiosError(error)) {

         if(error.code == 'ECONNABORTED'){
            runToast('La operacion no se pudo completar, verifique la conexion e intente nuevamente');

         }else{

            if(error.response?.status == 400){
               runToast('La operacion no se pudo completar, verifique la conexion e intente nuevamente');
            }
         }
      }
      
   } finally {
      
      fetchingHistory.value = false
   }
   
}

const openModapagoWeb = async () => {
   await Browser.open({ url : "https://modapago.com/"})
}

onBeforeMount(() => {
   inAccount.value = []
})

onMounted( async () => {
   await loadBalance()
   await fetchCurrentHistory()
})

</script>
<style scoped>
h2 { position: relative; }
</style>
<template>
   <ion-page>
      <BasePage>
         <ion-content class="secondary" fullscreen>
            <ion-grid>
               <ion-row>
                  <ion-col size="12">
                     <ion-item class="ion-margin-bottom" lines="none">
                        <ion-grid>
                           <ion-row>
                              <ion-col size="12">
                                 <small>En cuenta</small>
                              </ion-col>
                              <ion-col size="12">
                                 <ion-text color="modapago">
                                    <h2 v-if="inAccount.length > 0">
                                       <span>{{ inAccount[0] }}</span>
                                       <span class="mt-price">{{ inAccount[1] }}</span>
                                    </h2>
                                    <h2 v-else>
                                       <skeleton />
                                    </h2>
                                 </ion-text>
                              </ion-col>
                           </ion-row>
                        </ion-grid>
                     </ion-item>
                     <ion-item class="ion-margin-bottom" lines="none">
                        <ion-grid>
                           <ion-row>
                              <ion-col size="12">
                                 <small>Disponible</small>
                              </ion-col>
                              <ion-col size="12">
                                 <ion-text color="success">
                                    <h2 v-if="inAccount.length">
                                       <span>{{ available[0] }}</span>
                                       <span class="mt-price">{{ available[1] }}</span>
                                    </h2>
                                    <h2 v-else>
                                       <skeleton />
                                    </h2>
                                 </ion-text>
                              </ion-col>
                           </ion-row>
                        </ion-grid>
                     </ion-item>
                     <ion-item class="" lines="none">
                        <ion-grid>
                           <ion-row>
                              <ion-col size="12">
                                 <small>A liberar</small>
                              </ion-col>
                              <ion-col size="12">
                                 <ion-text color="warning">
                                    <h2 v-if="inAccount.length">
                                       <span>{{ toRelease[0] }}</span>
                                       <span class="mt-price">{{ toRelease[1] }}</span>
                                    </h2>
                                    <h2 v-else>
                                       <skeleton />
                                    </h2>
                                 </ion-text>
                              </ion-col>
                           </ion-row>
                        </ion-grid>
                     </ion-item>
                  </ion-col>
                  <ion-col size="8" offset="2">
                     <ion-button color="modapago" expand="block" shape="round" @click="openModapagoWeb">Ir a modapago (web)</ion-button>
                  </ion-col> 
               </ion-row>
            </ion-grid>
            <ion-grid>
               <ion-row>
                  <ion-col size="12">
                     <h5>Actividad reciente</h5>
                  </ion-col>      
               </ion-row>
               <ion-row>
                  <HistoryGrid
                        :movimientos="historyItems" 
                        :fetch="fetchingHistory"
                        :contar="_count"
                        :start="0"
                        :brand="historyBody._brand"
                        :type="'all'"               
                  />
               </ion-row>
            </ion-grid>
         </ion-content>
      </BasePage>
   </ion-page>
</template>