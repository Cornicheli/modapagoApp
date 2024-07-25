<script setup lang="ts">
import HistoryGrid from '@/components/HistoryGrid.vue';
import { axios, getData, parseDate, runToast } from '@/libs';
import appStore from '@/store/app';
import { IonDatetime, IonModal, IonSelect, IonSelectOption, IonInfiniteScroll, IonInfiniteScrollContent, IonFooter, IonList, IonItem, onIonViewWillEnter } from '@ionic/vue';
import { isAxiosError } from 'axios';
import { arrowDownSharp, calendar, calendarClearSharp, caretDownSharp, cashOutline, funnelSharp, optionsSharp, pricetagSharp, searchSharp } from 'ionicons/icons';
import moment from 'moment';
import { onBeforeMount, reactive, ref } from 'vue';

/** Configuracion de nuevos modals y pickers */

const parseDateLabel = (dateStr : string ) => {
   return moment(dateStr).format('DD/MM/YYYY')
}



/** Body para la busqueda de resultados */

const historyItems = ref<any>([])
const _count = ref(0)
const currentDate = new Date()
const global = appStore()

const historyBody = reactive({    
   token: getData('token'),
   start: 0,
   _start: moment().subtract(4, 'week').format("YYYY-MM-DD"),
   _end: moment().format("YYYY-MM-DD"),
   lenght: 20,            
   _brand: getData('user').owner.id,
   status: 'all', //eslint-disable-line
   order: 'payment', //eslint-disable-line
   type: 'all'
})

const fetchingHistory = ref(false)


const showMore = async (event: any) => {

   fetchingHistory.value = true;
   historyBody.start += 20;

   await fetchCurrentHistory(false, true)

   event.target.complete()
}

const fetchCurrentHistory = async (value : boolean = false, fromShowMore : boolean = false) => {

   fetchingHistory.value = true

   if(value == true){
      historyItems.value = [];
      historyBody.start = 0;
   }


   const parsedBody = {...historyBody};
         parsedBody._start = moment(historyBody._start).format("DD/MM/YYYY")
         parsedBody._end = moment(historyBody._end).format("DD/MM/YYYY")

   if (fromShowMore) {
      parsedBody.start += 20;
   }

   try {

      const http = await global.authAxios().get('/movimientos', {
         params: parsedBody,
         timeout:100000
      });

      const response = await http.data


      if(!response.message) {
         
         _count.value = response.count;
         
         if(!fromShowMore) {

            historyItems.value = (response.count > 0 ) ? response.coupons : []   

         } else {
            
            let newItems = historyItems.value;

            if(response.coupons) {
               for (const item of response.coupons) {
                  newItems.push(item);
               }            
            }

            historyItems.value = newItems;
         }

         console.log(historyItems.value);
         

      }
      
   } catch (error) {

      console.log(error);
      
      
   } finally {
      
      fetchingHistory.value = false
   }

}


const updateProperty = (value:string, type:string) => {

   switch (type) {
      case 'status':

         historyBody.status = value;
         
         break;

      case 'order':

         historyBody.order = value;

         break;

      case 'type':

         historyBody.type = value;

         historyBody.status = 'all';

         historyBody.order = 'payment';

         break;
   }
   //return fetchCurrentHistory();
}

onIonViewWillEnter( async () => {
   await fetchCurrentHistory()
})


</script>
<style scoped>
</style>
<template>
   <ion-page>
      <ion-content fullscreen class="secondary">
         <ion-grid>
            <ion-row>
               <ion-col size="12" class="ion-padding-top">
                  <ion-label style="font-weight: bold; color: #333">Rango de fechas:</ion-label>
               </ion-col>
               <ion-col size="6" style="padding-right: 0;">
                  <ion-item lines="none" style="border: 1px solid #3f3f3f; border-right: none">
                     <ion-icon :icon="calendar" slot="start" size="small" color="dark"></ion-icon>
                     <ion-label id="_start">{{ parseDateLabel(historyBody._start) }}</ion-label>
                     <IonModal class="pickerModal" :keep-contents-mounted="true" trigger="_start">
                        <ion-datetime
                           class="datetime-element"
                           :value="historyBody._start"
                           @ion-change="historyBody._start = String($event.target.value)"
                           presentation="date"
                           :show-default-buttons="true"
                           :done-text="'Listo'"
                           :cancel-text="'Cancelar'"
                           locale="es"
                           format="DD/MM/YYYY"
                        ></ion-datetime>
                     </IonModal>
                  </ion-item>
               </ion-col>
               <ion-col size="6" style="padding-left: 0;">
                  <ion-item lines="none" style="border: 1px solid #3f3f3f; border-left: none;">
                     <ion-icon :icon="calendar" slot="start" size="small" color="dark"></ion-icon>
                     <ion-label id="_end">{{ parseDateLabel(historyBody._end) }}</ion-label>
                     <IonModal class="pickerModal" :keep-contents-mounted="true" trigger="_end">
                        <ion-datetime                        
                           class="datetime-element"
                           @ion-change="historyBody._end = String($event.target.value )"
                           presentation="date"
                           :value="historyBody._end"
                           :show-default-buttons="true"
                           :done-text="'Listo'"
                           :cancel-text="'Cancelar'"
                           locale="es"
                           format="DD/MM/YYYY"
                        ></ion-datetime>
                     </IonModal>
                  </ion-item>
               </ion-col>
               <ion-col size="12" class="ion-padding-top">
                  <ion-label style="font-weight: bold; color: #333">Fitrar por:</ion-label>
               </ion-col>
               <ion-col size="12">
                  <IonList class="ion-no-padding">
                     <IonItem style="border: 1px solid gray;border-radius: 3px;" :detail="false" >
                        <ion-icon :icon="optionsSharp" size="small" slot="start"></ion-icon>
                        <ion-icon :icon="caretDownSharp" size="small" slot="end"></ion-icon>
                        <ion-select id="ion-select" :value="historyBody.type" :detail="false"   @ionChange ="updateProperty($event.target.value, 'type')" cancel-text="Volver" interface="action-sheet">
                           <ion-select-option value="all">Todas</ion-select-option>
                           <ion-select-option value="modatex">Cupones de Modatex</ion-select-option>
                           <ion-select-option value="direct">Cupones directos</ion-select-option>
                           <ion-select-option value="transferences">Transferencias</ion-select-option>
                           <ion-select-option value="services">Pago de servicios</ion-select-option>
                           <ion-select-option value="requests">Retiro / Pago a terceros</ion-select-option>
                           <ion-select-option value="rapipago_services">Pagos de servicios x Rapipago</ion-select-option>
                           <ion-select-option value="pagofacil_services">Pagos de servicios x Pagofacil</ion-select-option>
                        </ion-select>
                     </IonItem>
                  </IonList>
               </ion-col>
               <template v-if="historyBody.type == 'modatex' || historyBody.type == 'direct' || historyBody.type == 'requests'">
                  <ion-col size="12" class="ion-padding-top">
                     <ion-label style="font-weight: bold; color: #333">Ordernar por:</ion-label>
                  </ion-col>
                  <ion-col size="12">
                     <ion-item lines="none">
                        <ion-icon :icon="funnelSharp" slot="start"></ion-icon>
                        <ion-select  :value="historyBody.order"  @ionChange ="updateProperty($event.target.value, 'order')" cancel-text="Volver" interface="action-sheet" style="max-width: 100%;">
                           <ion-select-option value="payment">Fecha de Pago</ion-select-option>
                           <ion-select-option value="created">Fecha de creación</ion-select-option>
                        </ion-select>                          
                     </ion-item>
                  </ion-col>
               </template>
               <template v-if="historyBody.type == 'services'">
                  <ion-col size="12" class="ion-text-center">
                     <ion-item lines="none">
                        <ion-icon :icon="cashOutline" slot="start"></ion-icon>
                        <ion-select :value="historyBody.status" @ionChange ="updateProperty($event.target.value, 'status')" cancel-text="Volver" interface="action-sheet" style="max-width: 100%;">
                           <ion-select-option value="all">Estado de pago</ion-select-option>
                           <ion-select-option value="INICIADA" >Iniciada</ion-select-option>
                           <ion-select-option value="CONFIRMADO_CON_RECHAZOS">Confirmada con rechazos</ion-select-option>
                           <ion-select-option value="RECHAZADO">Rechazadas</ion-select-option>
                           <ion-select-option value="CONFIRMADO">Confirmada</ion-select-option>
                           <ion-select-option value="CON_ANULACION">Anuladas</ion-select-option>
                           <ion-select-option value="EN_PROCESO">En proceso</ion-select-option>
                        </ion-select>                         
                     </ion-item>
                  </ion-col>
               </template>
               <ion-col size="12">
                  <ion-button color="modapago" expand="block" round="shape" @click="fetchCurrentHistory">
                     <ion-icon :icon="searchSharp" slot="start"></ion-icon>
                     <ion-label>Buscar</ion-label>
                  </ion-button>
               </ion-col>               
            </ion-row>
         </ion-grid>
         <ion-grid>
            <ion-row>
               <ion-col size="12" class="ion-no-margin ion-margin-bottom">
                  <HistoryGrid 
                     :movimientos="historyItems" 
                     :fetch="fetchingHistory" 
                     :contar="_count"
                     :start="historyBody.start" 
                     :brand="historyBody._brand"                      
                     :type="'all'"
                     @movimientos="fetchCurrentHistory(true)"
                  />
               </ion-col>
               <ion-col size="12" class="ion-margin-top">
                  <div v-if="_count > 0 &&  Object.keys(historyItems).length < _count && fetchingHistory == false">
                     <ion-infinite-scroll threshold="100px" @ionInfinite="showMore($event)">
                              <ion-infinite-scroll-content
                                 :loading-spinner="null">
                              </ion-infinite-scroll-content>
                     </ion-infinite-scroll>
                  </div>
               </ion-col>
            </ion-row>
         </ion-grid>
      </ion-content>      
   </ion-page>
</template>
<style scoped>

ion-modal.pickerModal {
  --width: fit-content;
  --min-width: 250px;
  --height: fit-content;
  --border-radius: 6px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}
ion-select::part(icon) {
   display: none;
}

ion-select { --height: auto; min-height: auto; --padding: 0; padding: 0;}

</style>
