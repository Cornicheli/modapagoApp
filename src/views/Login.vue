<script setup lang="ts">
import { runAlert, runLoader } from '@/libs';
import { axios } from '@/libs';
import { isAxiosError } from 'axios';
import { onBeforeMount, reactive } from 'vue';
import { useRouter } from 'vue-router';

const form = reactive({
   username : "",
   password : ""
})

const router = useRouter()

const submitLogin = async () => {
   
   const loader = await runLoader('Validando datos')

   try {
      
      const http = await axios.post('/login', form)
      const data = await http.data
      
      console.log(data);

      const { Permissions, error, token } = data
      
      if (error == 'success') {

         localStorage.setItem('token', token)
         localStorage.setItem('permissions', Permissions)
      
         return router.replace({name:'app.home'})
      }

      if (error == 'need_verification') {
         
         runAlert('Tu cuenta no ha sido verificada, por favor revisa tu correo electrónico.')
         return;
      }
      
   } catch (error) {
      
      if (isAxiosError(error)) {

         if (error.code == 'ERR_NETWORK' || error.code == 'ECONNABORTED') {

            runAlert('No se pudo realizar la transacción, revisa tu conexión y vuelve a intentar.')
            return;

         } else {

            const status = error.response?.status;

            if (status == 400) {
               runAlert('Datos de usuario incorrectos.')      
            } else if(status == 422) {
               runAlert('Los campos usuario y clave son obligatorios.')
            } else if(status == 429) {
               runAlert('Limite de intentos excedidos, intenta de nuevo en 60 segundos.')
            }

            return;

         }         
      }
      
   } finally {

      loader.dismiss()
   }
}  

onBeforeMount( () => {
   localStorage.removeItem('token')
})
</script>   
<template>
   <ion-page>
      <ion-content fullscreen>
         <ion-grid class="ion-margin-top">
            <ion-row class="ion-align-items-center ion-text-center">
               <ion-col size="10" offset="1">
                  <img src="/img/logo-modapago-all.png" alt="Modapago" style="width:95%; margin: auto;" />
                  <p>Ingresá con tus datos de Modapago:</p>
               </ion-col>
               <ion-col size="11" offset="0.5">
                  <ion-item lines="full">
                     <ion-input                        
                        type="text"
                        pattern="text"
                        v-model="form.username"
                        placeholder="Usuario"
                        label="Usuario o Email de Modapago: "
                        label-placement="stacked"
                        @keyup.enter="submitLogin"
                     />
                  </ion-item>
               </ion-col>
               <ion-col size="11" offset="0.5">
                  <ion-item lines="full">
                     <ion-input
                        type="password"
                        pattern="password"
                        v-model="form.password"
                        placeholder="Clave"
                        label="Clave de Modapago: "
                        label-placement="stacked"
                        @keyup.enter="submitLogin"
                     />
                  </ion-item>
               </ion-col>             
               <ion-col size="10" offset="1">
                  <ion-button class="ion-margin-top" color="modatex" expand="block" shape="round" @click="submitLogin">
                     Iniciar
                  </ion-button>
                  <p style="font-size: 0.9rem; margin-top: 20px;">
                     <ion-text>¿Olvidate tu clave? </ion-text> 
                     <RouterLink to="/recover/password" style="text-decoration: none;">Hace click acá.</RouterLink>
                  </p>
               </ion-col>                                
            </ion-row>
         </ion-grid>
      </ion-content>
   </ion-page>
</template>