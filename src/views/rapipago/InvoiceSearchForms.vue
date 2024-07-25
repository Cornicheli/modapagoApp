<template>
   <ion-page>
      <BasePage>
         <ion-content fullscreen class="secondary">
            <ion-item lines="full">
               <ion-grid>
                  <ion-row class="ion-text-center">
                     <ion-col size="12">
                        <ion-text class="ion-text-center">{{ store.serviceName }}</ion-text>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </ion-item>
            <ion-grid>
               <ion-row v-if="modalidades">
                  <ion-col size="11" offset="0.5">
                     <div v-for="(modalidad, index) of modalidades" :key="index">
                        <ion-button class="rapi-header-btn" style="height: auto;">{{ modalidad.description }}</ion-button>
                        <div v-for="(form, i) of modalidad.form" :key="i">
                           <ion-item class="rapi-input" lines="none">
                              <div>
                                 <ion-label v-if="form.component == 'LABEL'">{{ form.label }}</ion-label>
                                 <template v-if="form.component == 'TEXT_FIELD' || form.component == 'HIDDEN_TEXT_FIELD'">

                                    <ion-input v-if="form.dataType == 'ALF'" :placeholder="form.label"
                                       @input="modalidades[index]['form'][i]['value'] = formatValue($event.target.value, modalidades[index]['form'][i]['length'])"></ion-input>

                                    <ion-input v-if="form.dataType == 'IMP'" :placeholder="form.label"
                                       @input="modalidades[index]['form'][i]['value'] = $event.target.value"></ion-input>

                                    <ion-input v-if="form.dataType == 'CBA'" :placeholder="form.label"
                                       @input="modalidades[index]['form'][i]['value'] = formatValue($event.target.value, modalidades[index]['form'][i]['length'])"></ion-input>
                                 
                                    
                                    <template v-if="form.dataType == 'FEC'">
                                       <ion-label v-text="(!modalidades[index]['form'][i]['value']) ? form.label : formatDateHuman(modalidades[index]['form'][i]['value'])" :id="`form_${index}`" /> 
                                       <IonModal class="pickerModal" :keep-contents-mounted="true" :trigger="`form_${index}`">
                                          <ion-datetime 
                                                         presentation="date"
                                                         :placeholder="form.label"
                                                         @ionChange="modalidades[index]['form'][i]['value'] = formatDate($event.target.value)" />
                                       </IonModal>
                                    </template>

                                 </template>
                                 <template v-if="form.component == 'COMBO_BOX_ESTATICO'">
                                    <ion-select :placeholder="form.label"
                                       @ionChange="modalidades[index]['form'][i]['value'] = $event.target.value"
                                       cancel-text="Volver" style="max-width: 100%;">
                                       <ion-select-option v-for="(text, value) of form.values" :key="value" :value="value">{{
                                          text }}</ion-select-option>
                                    </ion-select>
                                 </template>
                              </div>
                           </ion-item>
                        </div>
                        <ion-button color="success" @click="getFacturas(index)">Buscar</ion-button>
                     </div>
                  </ion-col>
               </ion-row>
               <ion-row v-else>
                  <ion-col v-for="n of 12" size="12">
                     <skeleton animated style="height: 20px;" />
                     <skeleton animated style="height: 15px;" />
                     <skeleton animated style="height: 30px; width: 60px;" />
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </BasePage>
   </ion-page>
</template>
 
<script setup lang="ts">

import useRapipagoStore from '@/store/rapipago';
import moment from 'moment';
import { onBeforeMount, ref } from 'vue'

import { IonSelect, IonSelectOption, IonDatetimeButton, IonDatetime, IonModal, onIonViewWillEnter } from '@ionic/vue';
import { getData, runLoader, runToast } from '@/libs';
import { runAlert } from '@/libs';
import { useRouter } from 'vue-router';
import BasePage from '@/components/BasePage.vue';
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';

const store = useRapipagoStore()

const router = useRouter()

const modalidades = ref<any>()

const formatValue = (value: string, length: number) => {

   let str = '' + value;

   while (str.length < length) {
      str = '0' + str;
   }

   return str;
}

const formatDate = (date: any) => {
   return moment(date).format('YYYY-MM-DD')
}

const formatDateHuman = (date: any) => {
   return moment(date).format('DD/MM/YYYY')
}

const buildSearchForms = async () => {

   await store.getToken()

   try {
      
      const http = await store.http.post(`company/${store.serviceId}/get-payment-mode`, { rapipago_token : store.authToken })
      const response = await http.data;

      if (response.httpCode || response.exception || response.message) {
         throw new Error('Error interno');
      }

      for (let iModalidad in response) {
         if (Object.hasOwnProperty.call(response, iModalidad)) {
            let modalidad = response[iModalidad].form;
            for (const iForm in modalidad) {
                  if (Object.hasOwnProperty.call(modalidad, iForm)) {
                     response[iModalidad]['form'][iForm].value = null;
                  }
            }
         }
      }

      modalidades.value = response;

   } catch (error) {

      await store.ajaxError(error)
   
      return router.replace({ path : '/app/rapipago'})
   }
}

const getFacturas = async (index: any) => {
   
   await store.getToken()

   const loader = await runLoader('Trayendo resultados, aguarde.')
   
   let currentForm = modalidades.value[index];

   if (currentForm.paymentType == 'CLR' || currentForm.paymentType == "CEI") {
      
      let form = currentForm.form[0];

      if (form.isCLR) { 
         
         const barcode = form.value;

         try {

            const http = await store.http.post(`/company/barcode/${barcode}`, {
               rapipago_token : store.authToken,
               params : {
                  companyCode : store.serviceId
               }
            })

            const response = await http.data;
            
            if (response.length == 0) {   
               const message = 'Rapipago no encontró tu factura, revisa no se encuentre expirada. O haz la búsqueda manual.';               
               throw new Error(message)
            }

            if (response.errors) {
               throw new Error(response.errors)
            }

            if (response.length > 1) {
               localStorage.rapiBarrasEncontradas = JSON.stringify(response);
               return router.push({ name : 'Buscar facturas x barras - Selec. Servicio | Rapipago - Sucursal virtual'});
            }

            if (response.length == 1) {
               localStorage.rapiVencimientos = JSON.stringify(response);
               
               return router.push({ name : 'app.rapipago.invoices', params : {
                     companyId : store.serviceId,
                     companyName : encodeURI(store.serviceName)
                  } 
               });                
            }             
            
         } catch (errors) {

            await store.ajaxError( errors )
            
         } finally {

            loader.dismiss()
         }
         
      }
   }

   if(currentForm.paymentType != "CAB" && currentForm.paymentType != "CRC") {

      let endPoint = `company/${store.serviceId}/get-invoice/${currentForm.id}`;
      let formFormated: any = {};

      for (const form of currentForm.form) {

            if (form.dataType == 'FEC') {
               form.value = formatDate(form.value);
            }

            formFormated[form.field] = form.value;
      }

      localStorage.rapiSearchForm = JSON.stringify(formFormated);

      try {

         formFormated.rapipago_token = store.authToken;

         const http = await store.http.post(endPoint, formFormated);
         const response = await http.data;

         let facturas = response;

         if (facturas.httpCode) {
            throw new Error('Error interno, vuelva a intentar codigo: #' + facturas.httpCode);
         }            

         if (facturas.errors) {             
            throw new Error(facturas.errors);
         }

         if (facturas.length == 0) {
            throw new Error('¡No encontramos vencimientos!');
         }                        


         localStorage.rapiVencimientos = JSON.stringify(facturas);

         return router.push({ name : "app.rapipago.invoices", params : { companyId : store.serviceId, companyName : encodeURI(store.serviceName) }});
         
      } catch (error) {

         store.ajaxError(error)
         
      } finally {


         loader.dismiss()
      }

   } else {

         let formFormated: any = {};

         for (const form of currentForm.form) {

            if (form.dataType == 'FEC') {
               form.value = formatDate(form.value);
            }

            formFormated[form.field] = form.value;
         }


         const pago = {
            "paymentMethod": "PES",
            "companyCode": store.serviceId,
            "companyName": store.serviceName,
            "paymentModeId": currentForm.id,                                    
            "form" : formFormated
         }    

         localStorage.rapiSearchForm = JSON.stringify(pago);                
         
         loader.dismiss()
         
         return router.push({ name : 'app.rapipago.cab-payment', params : {
               'companyId': store.serviceId,
               'companyName': store.serviceName
            } 
         });

   }
   
}

onIonViewWillEnter( async () => {
   await buildSearchForms()
})

</script>
<style>
.rapi-header-btn {
   white-space: normal;
   margin-top: 1em;
   --padding-top: 0.5em;
   --padding-bottom: 0.5em;
}

.rapi-input {
   margin-top: 0.5em;
   margin-bottom: 0.5em;
   --border-radius: 0.8em;
}

.rapi-input ion-input,
.rapi-input ion-datetime {
   --border-radius: 0.8em;
}

.rapi-input ion-datetime,
.rapi-input ion-select {
   --padding-start: 0;
}
</style>
<style scoped>
ion-button {
   border: none !important;
   -webkit-box-shadow: none;
   box-shadow: none;
   --background: #b1b1b1;
   --background-hover: #b1b1b1;
   --color: rgb(68, 68, 68);
   --box-shadow: none;
}
</style>