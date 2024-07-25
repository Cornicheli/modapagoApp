<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import { axios, runAlert, runLoader, runToast } from '@/libs';
import usePagofaciStore from '@/store/pagofacil';
import { onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const store = usePagofaciStore()
const router = useRouter()
const { invoice, codigoBarras, barcodeAdditionalData } = storeToRefs(store)

const getInvoice = async (item: any) => {

   const loader = await runLoader('Procesando operación, aguarde...')

   try {
      
      for (let x = 0; x < barcodeAdditionalData.value.length; x++) {
         
         const element = barcodeAdditionalData.value[x];
         
         if(element['importeVariable']) {
            element['valor'] = Number(element['valor']).toFixed(2);
         }

         barcodeAdditionalData.value[x] = element;
      }

      const resp = await axios.post(`${import.meta.env.VITE_APP_PAGOFACIL_URL}/operation/barcode/prepare`, {
         codigoBarras : codigoBarras.value,
         datosAdicionales : barcodeAdditionalData.value
      })

      const { api_response, api_status } = await resp.data;

      item.visible = false;

      if (api_status == 200) {

         const body = barcodeAdditionalData.value;
         const len = body.length - 1;
         const lastItem = body[len];
         let lastOrdinal = (lastItem.ordinal < 2) ? 3 : (lastItem.ordinal + 1);

         let baseValor = 0;

         body.push({
            descripcion: api_response.descripcion,
            valor : baseValor,
            ordinal : lastOrdinal,
            visible : true,
            opciones : api_response.opciones,
            importeVariable : api_response.importeVariable,
            importeMinimo : api_response.importeMinimo,
            importeMaximo : api_response.importeMaximo
         })

         barcodeAdditionalData.value = body;

         await runToast('Vamos a pedirte algunos datos adicionales.')
      }

      if( api_status == 201) {

         store.invoice = api_response
         return await router.push({ name : 'pagofacil.barcode.invoice'})
      }

      if(api_status >= 400)
         throw new Error(api_response.message);

   } catch (error) {

      if (isAxiosError(error)) {

         await runAlert(error.response?.data.message)

      } else {

         await runAlert(String(error))
      }
      
   } finally {

      loader.dismiss()
   }
}

const importeVariableCaption = (item: any) : string => {

   return `Ingrese monto entre $${item.importeMinimo} y $${item.importeMaximo}`;
}

onIonViewWillEnter( () => {
   if (!barcodeAdditionalData.value || barcodeAdditionalData.value.length == 0) {
      return router.push({ name: 'pagofacil' })
   }
})

onIonViewWillLeave(() => {
   barcodeAdditionalData.value = undefined
   codigoBarras.value = undefined
})

</script>
<template>
   <ion-page>
      <BasePage v-if="barcodeAdditionalData">
         <ion-content fullscreen color="light">
            <ion-header>
               <ion-toolbar>
                  <ion-title class="ion-text-center">
                     Buscar vencimientos
                  </ion-title>
               </ion-toolbar>
            </ion-header>
            <ion-grid class="ion-margin-top">
               <ion-row>
                  <ion-col size="12">
                     <template v-for="item of barcodeAdditionalData">                        
                        <ion-list v-if="item.visible" class="ion-no-padding">
                           <ion-list-header color="medium" style="font-size: 1.01em; --height: auto;">
                              <div>
                                 <div>
                                    <b>
                                       {{ item.descripcion }}
                                    </b>
                                 </div>             
                                 <div v-if="item.importeVariable">
                                    <small>{{ importeVariableCaption(item) }}</small>
                                 </div>  
                              </div>
                           </ion-list-header>
                           <ion-item lines="full">                              
                              <ion-input v-model="item.valor" :placeholder="item.descripcion" label="Ingrese dato" label-placement="floating" v-if="!item.opciones && !item.importeVariable" />
                              <ion-input v-model="item.valor"    
                                         :label="item.descripcion"
                                         :placeholder="'$' + item.valor"                                                                             
                                         label-placement="stacked" 
                                         type="number"
                                         v-else-if="!item.opciones && item.importeVariable" />

                              <ion-select :placeholder="item.descripcion" 
                                          label="Seleccione una opción" 
                                          label-placement="floating" 
                                          interface="action-sheet" 
                                          @ion-change="item.valor = $event.detail.value"
                                          v-else>
                                 <ion-select-option v-for="opcion of item.opciones" :value="opcion">                              
                                    {{ opcion }}                             
                                 </ion-select-option>
                              </ion-select>                              
                           </ion-item>                           
                           <ion-item v-if="item.importeVariable" lines="none" class="ion-no-padding-vertical">
                                 <small>
                                    Total de la factura: ${{ item.importe }}
                                 </small>
                           </ion-item>                            
                           <ion-button color="success" style="margin: 10px" @click="getInvoice(item)">Continuar</ion-button>
                        </ion-list>
                     </template>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </BasePage>
   </ion-page>
</template>