
<script setup lang="ts">
import BasePage from '@/components/BasePage.vue'
import { axios, runToast, setData } from '@/libs'
import useTransferenceStore from '@/store/transferences'
import { IonList, IonListHeader, IonSearchbar, IonNote } from '@ionic/vue'
import { arrowForwardCircleSharp } from 'ionicons/icons'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

//const store = appStore()

const transferStore = useTransferenceStore()
const router = useRouter()
const email = ref()
const results = ref()
const fetching = ref(false)

const searchContacts = async () => {
   
   if (!email.value) {
      runToast('Ingresa un dato válido.')
      return false;
   }

   
   if(String(email.value).trim().length < 1) {
      runToast('Ingrese al menos 1 caracter del mail.')  
      return false;
   }
   
   results.value = []
   fetching.value = true

   const http = await axios.get('/get_mails', {
      params: {
         email: email.value
      }
   });

   const response = await http.data;
   
   results.value = response.brands;

   fetching.value = false

}


const sendMoney = (destinatary : object) => {
   
   results.value = []
   email.value = undefined

   transferStore.destinatary = destinatary
   
   router.push({ name: 'app.transfer.checkout' })

   return false;
}

</script>
<template>
   <ion-page>
      <BasePage>
         <ion-content class="secondary" fullscreen>
            <ion-grid>
               <ion-row>
                  <ion-col size="12">                  
                     <ion-searchbar v-model="email" placeholder="Ingresá el correo" @keyup.enter="searchContacts" :show-clear-button="'focus'" />
                  </ion-col>
                  <ion-col size="8" offset="2">
                     <ion-button color="modapago" @click="searchContacts" expand="block">Buscar</ion-button>
                  </ion-col>
                  <ion-col size="12">
                     <IonList>
                        <IonListHeader>Estos son los resultados: </IonListHeader>
                        <ion-item v-if="(!results || results.length == 0) && fetching" v-for="n of 12">
                           <ion-label text-wrap>
                              <h6><skeleton animated :style="`width: 100px;`" /></h6>
                           </ion-label>
                           <ion-note slot="end" class="ion-padding">
                              <h6><skeleton animated :style="`width: 100px;`" /></h6>
                           </ion-note>                        
                        </ion-item>
                        <ion-item lines="none" v-else-if="(!results || results.length == 0) && !fetching">
                           Sin resultados
                        </ion-item>
                        <ion-item v-else v-for="brand in results" :key="brand.id">
                           <ion-label text-wrap>
                              <p>E-mail: {{brand.email}}</p>
                              <p>Nombre: {{brand.owner.name}}</p>
                           </ion-label>                        
                           <ion-icon 
                                    color="modapago" 
                                    @click="sendMoney(brand.owner)" 
                                    :icon="arrowForwardCircleSharp" 
                                    style="font-size: 3rem;" slot="end" />                     
                        </ion-item>                     
                     </IonList>
                  </ion-col>
               </ion-row>
            </ion-grid>
         </ion-content>
      </BasePage>
   </ion-page>
</template>