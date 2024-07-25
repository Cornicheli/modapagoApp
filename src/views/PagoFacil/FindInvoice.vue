<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import { axios, runAlert } from '@/libs';
import usePagofaciStore from '@/store/pagofacil';
import { onIonViewDidEnter, onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const store = usePagofaciStore()
const { company } = storeToRefs(store)
const companyForms = computed( () => company.value.forms )
const fetching = ref(false)
let body: any[] = []

const getExternalForms = async () => {

   try {
      
      fetching.value = true

      const resp = await axios.post(`${import.meta.env.VITE_APP_PAGOFACIL_URL}/operation/prepare`, {
         idProducto : company.value.internal_id,
         datosAdicionales: []
      })

      const data = await resp.data
      const { api_response, api_status } = data

      if(api_status == 200) {

         const form = api_response.transacciones[0];

         store.company.forms.push({
            descripcion : form.descripcion,
            ordinal: 1
         })
      }

   } catch (error) {

      if(isAxiosError(error))
         return await runAlert(error.response?.data.message)

      return await runAlert(String(error))
      
   } finally {

      fetching.value = false
   }
}

const findInvoice = async (i: number) => {
   
   try {

      fetching.value = true

      body = []
      
      companyForms.value[i].completed = true;
      

      store.company.forms = companyForms.value.map( (item:  any) => {      
         item.hidden = true
         if(item.completed) {
            body.push({
               ordinal: item.ordinal,
               valor: ( (!item.importeVariable) ? item.valor : Number(item.valor).toFixed(2) )
            })
         }
         return item
      })

      const resp = await axios.post(import.meta.env.VITE_APP_PAGOFACIL_URL + '/operation/prepare', {
         idProducto : company.value.internal_id,
         datosAdicionales : body
      })

      const data = await resp.data
      const { api_response, api_status } = data;
      
      if(api_status == 200) {
         
         const newForm = api_response.transacciones[0];
         const lastItem = body[(body.length - 1)];
         let nextOrdinal = lastItem.ordinal;

         if(lastItem.ordinal < 2) 
            nextOrdinal = 3;
         else
            nextOrdinal += 1

         let baseValor : string|number = ""

         if(newForm.importeVariable && newForm.importe === null) {
            newForm.importe = 0;
         }

         if(newForm.importeVariable) {
            baseValor = newForm.importe                                 
         }


         store.company.forms.push({
            descripcion: newForm.descripcion,
            valor : baseValor,
            ordinal : nextOrdinal,
            importeMinimo : newForm.importeMinimo,
            importeMaximo : newForm.importeMaximo,
            importe : newForm.importe,
            importeVariable : newForm.importeVariable,
            opciones : newForm.opciones
         })
      
      } else if (api_status == 201) {

         store.invoice = api_response.transacciones
         store.company.wasLeft= true;

         return router.push({ name: 'pagofacil.invoices'})

      } else if( api_status >= 400 ) {

         store.company.forms = companyForms.value.map( (item:  any, index : number) => {      
         
            item.hidden = true;
            
            if(index == (companyForms.value.length - 1) ) 
               item.hidden = false

            return item
         })
         
         if(api_status == 400)
            throw new Error("Los datos enviados son incorrectos.");

         if(api_status == 500)
            throw new Error("El dato ingresado es inexistente o no posee deuda.");
      }

   } catch (error) {

      if (isAxiosError(error)) {
         return await runAlert(error.response?.data.message)
      }

      await runAlert(String(error))

   } finally {

      fetching.value = false
      
   }
}

const buildForms = async () => {   
   
   if(store.company == undefined)   
      return await router.replace({ name : 'pagofacil' })
   
   if(!store.company.forms.length)
      await getExternalForms()
}

const importeVariableCaption = (item: any) : string => `Ingrese monto entre $${item.importeMinimo} y $${item.importeMaximo}`;


onIonViewWillEnter( async () => {   
   
   if(!store.company || !company.value || store.company.wasLeft)
      await router.replace({ name : 'pagofacil' })

   await buildForms()
})


onIonViewWillLeave( () => {
   store.company = undefined
   body = []
})

</script>
<template>
   <ion-page>
      <BasePage>
         <ion-content fullscreen color="light">
            <ion-header v-if="company">
               <ion-toolbar  style="padding: 5px">
                  <ion-title class="ion-text-center"> 
                     {{ company.company_name }} 
                  </ion-title>
               </ion-toolbar>
            </ion-header>
            <template v-if="store.company">
               <ion-grid v-if="!fetching">
                  <ion-row>
                     <ion-col size="12">
                        <template v-for="(form, i) in companyForms">
                           <ion-list class="ion-no-padding ion-margin-top" v-if="!form.hidden">
                              <ion-list-header color="medium">
                                 <div>
                                    <div>
                                       <b>
                                          {{ form.descripcion || 'Elegi que queres pagar' }} 
                                       </b>
                                    </div>             
                                    <div v-if="form.importeVariable">
                                       <small>{{ importeVariableCaption(form) }}</small>                                       
                                    </div>  
                                 </div>
                              </ion-list-header>                              
                              <ion-item lines="full">
                                 <ion-input v-if="!form.opciones  && !form.importeVariable" v-model="form.valor" :placeholder="form.descripcion" label="Ingrese dato" label-placement="floating" />
                                 <ion-input 
                                            type="number"
                                            v-model="form.valor" 
                                            :placeholder="'$' + form.importe"                                             
                                            :label="form.descripcion"
                                            label-placement="stacked" 
                                            v-else-if="!form.opciones && form.importeVariable" 
                                 />
                                 <ion-select :placeholder="form.descripcion" 
                                             label="Seleccione una opción" 
                                             label-placement="floating" 
                                             interface="action-sheet" 
                                             @ion-change="form.valor = $event.detail.value"
                                             required
                                             v-else>
                                    <ion-select-option v-for="opcion of form.opciones" :value="opcion">                              
                                       {{ opcion }}                             
                                    </ion-select-option>
                                 </ion-select>
                              </ion-item>
                              <ion-item lines="none" v-if="form.importeVariable">
                                 <small>Total de la factura: ${{ form.importe }}</small>
                              </ion-item>
                              <ion-button color="success" style="margin: 10px;" size="small" @click="findInvoice(i)">Enviar</ion-button>
                           </ion-list>
                        </template>
                     </ion-col>
                  </ion-row>
               </ion-grid>
               <ion-grid v-else>
                  <ion-row v-for="n of 5">
                     <ion-col size="12">
                        <skeleton animated style="width: 100%; height: 20px;" />
                     </ion-col>
                     <ion-col size="12">
                        <skeleton animated style="width: 100%; height: 80px;" />
                     </ion-col>
                     <ion-col size="12">
                        <skeleton animated style="width: 100px; height: 20px;" />
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </template>
         </ion-content>
      </BasePage>
   </ion-page>
</template>