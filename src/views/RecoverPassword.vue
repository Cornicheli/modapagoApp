<script setup lang="ts">
import { ref } from 'vue';

const email = ref<string>()
const submitPasswordRecover = () => {}

</script>   
<template>
   <ion-page>
      <ion-header>
         <ion-toolbar color="modapago">
            <ion-title>Recuperación de clave</ion-title>
            <ion-back-button slot="start">Volver</ion-back-button>
         </ion-toolbar>
      </ion-header>
      <ion-content class="secondary ion-padding" fullscreen>
         <ion-grid class="ion-margin-top">
            <ion-row class="ion-align-items-center ion-padding ion-text-center" style="background-color: #fff; border-radius: 15px;">
               <ion-col size="12">
                  <img src="/img/logo-modapago-all.png" alt="Modapago" style="width: 75%;" />                  
               </ion-col>
               <ion-col size="11" offset="0.5">
                  <ion-item lines="full">
                     <ion-input
                        type="text"
                        pattern="text"
                        v-model="email"
                        placeholder="Usuario"
                        label="Email de Modapago: "
                        label-placement="stacked"
                     />
                  </ion-item>
               </ion-col>            
               <ion-col size="11" offset="0.5">
                  <ion-button class="ion-margin-top" color="modapago" expand="block" shape="round">Solicitar</ion-button>
               </ion-col>                                
            </ion-row>
         </ion-grid>
      </ion-content>
   </ion-page>
</template>