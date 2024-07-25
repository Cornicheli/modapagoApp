<script setup lang="ts">
import BasePage from '@/components/BasePage.vue';
import { runAlert, runLoader } from '@/libs';
import appStore from '@/store/app';
import { IonCard, IonCardContent, IonCardHeader, IonChip } from '@ionic/vue'
import { storeToRefs } from 'pinia';
import { reactive, ref } from 'vue';

const store = appStore()
const { authAxios } = store
const { token } = storeToRefs(store)

type TErrors = {
   "actual_password": any,
   "password": any,
   "password_confirm": any
}

const errors = reactive<TErrors>({
   "actual_password": undefined,
   "password": undefined,
   "password_confirm": undefined
})

const form = reactive({
   actual_password : "",
   password : "",
   password_confirm : ""
})



const resetFields = () => {
   
   form.actual_password = ''
   form.password = ''
   form.password_confirm = ''

}

const resetMessages = () => {

   errors.actual_password = ''
   errors.password = ''
   errors.password_confirm = ''
}

const validationPass = () => {

   if(!form.actual_password) {
      errors.actual_password = 'Este campo es obligatorio.';
      return false
   }
   
   if(!form.password) {
      errors.password = 'Este campo es obligatorio.';
      return false
   }

   if(!form.password_confirm) {
      errors.password_confirm = 'Este campo es obligatorio.';
      return false
   }

   if(form.password.trim().length < 8) {
      errors.password = 'La nueva clave debe tener al menos 8 caracteres.';
      return false
   }

   if (form.password.trim() != form.password_confirm.trim()) {
      errors.password = 'Las nuevas claves no coinciden.'
      return false
   }

   return true;

}


const submit = async () => {

   const loader = await runLoader('Aguarde un momento')

   resetMessages();

   if(!validationPass()) {
      console.log('no pasa?');
      
      loader.dismiss()
      return false;
   }
   
   try {

      const http = await authAxios().post('/change', {
         token: token.value,
         pass0: form.actual_password,
         pass1: form.password,
         pass2: form.password_confirm
      })

      const response = await http.data

      if(response.message == 'The given data was invalid.'){
         
         errors.actual_password = response.errors.actual_password
         errors.password = response.errors.password
         errors.password_confirm = response.errors.password_confirm

      } else if(response.status == 'success'){

         runAlert('La clave fue cambiada con éxito.');

      } else if(response.status == 'passwords_not_match'){

         errors.actual_password = 'La contraseña no es correcta';

      } else if(response.status == 'error'){

         runAlert(response.message);

      } else if (response.exception) {

         runAlert('Servicio no disponible, contactar a soporte@modapago.com.')
      }
      

   } catch (error) {

      console.log(error);
      

   } finally {

      loader.dismiss()
   }

}
</script>

<style scoped>
ion-chip { padding: 5px 10px; height: auto; }
</style>
<template>   
   <ion-page>
      <base-page>
         <ion-content class="secondary" fullscreen>
            <ion-card>
               <ion-card-header color="modapago" class="ion-text-center">Cambiar contraseña</ion-card-header>
               <ion-card-content class="ion-margin-top">
                  <ion-item lines="full">
                     <ion-input type="password" 
                              pattern="password"
                              placeholder="****"
                              label="Contraseña actual: "
                              label-placement="stacked"
                              v-model="form.actual_password"
                     />
                  </ion-item>
                  <ion-chip color="danger" v-if="errors.actual_password">{{ errors.actual_password }}</ion-chip>
                  <ion-item lines="full">
                     <ion-input type="password" 
                              pattern="password"
                              placeholder="****"
                              label="Nueva contraseña: "
                              label-placement="stacked"
                              v-model="form.password"
                     />
                  </ion-item>
                  <ion-chip color="danger" v-if="errors.password">{{ errors.password }}</ion-chip>
                  <ion-item lines="full">
                     <ion-input type="password" 
                              pattern="password"
                              placeholder="****"
                              label="Repetir contraseña: "
                              label-placement="stacked"
                              v-model="form.password_confirm"
                     />
                  </ion-item>
                  <ion-chip color="danger" v-if="errors.password_confirm">{{ errors.password_confirm }}</ion-chip>
                  <ion-grid>
                     <ion-row>
                        <ion-col size="10" offset="1">
                           <ion-button color="modapago" expand="block" shape="round" @click="submit">Enviar</ion-button>
                        </ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-card-content>
            </ion-card>
         </ion-content>
      </base-page>
   </ion-page>
</template>