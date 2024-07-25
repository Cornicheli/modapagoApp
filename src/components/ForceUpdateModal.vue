<template>
   <ion-page>
      <ion-content color="modapago" fullscreen>
         <Swiper>
            <SwiperSlide>
               <ion-grid class="ion-no-padding">
                  <ion-row>
                     <ion-col size="6" offset="3" class="ion-padding-vertical">
                        <img src="/img/logo_slider.png" alt="modapago" style="width: 80%; padding-bottom: 10px;" />                        
                     </ion-col>
                     <ion-col size="10" offset="1">
                        <h3>Aviso importante</h3>
                        <br>                        
                        <ion-text>
                           Llegó una nueva versión de la app, hacé click en el siguiente botón para actualizarla:
                        </ion-text>
                        <br>
                     </ion-col>
                     <ion-col size="8" offset="2">
                        <br>
                        <ion-button color="modatex" expand="full" shape="round" @click="actualizarApp">Actualizar app</ion-button>
                     </ion-col>
                  </ion-row>
               </ion-grid>               
            </SwiperSlide>
         </Swiper>
      </ion-content>
   </ion-page>
</template>
<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Browser } from '@capacitor/browser';
import { onBeforeMount } from 'vue';
import appStore from '@/store/app';

const store = appStore()
const props = defineProps<{ detail : any, versionCode : number }>()

const actualizarApp = async () => {   
   await Browser.open({ url: props.detail.platform.link })
}

onBeforeMount(() => {   
   store.logout()
})
</script>
<style scoped>
.swiper {
   height: 100vh;
   --bullet-background: #FFFFFF;
   --bullet-background-active: var(--ion-color-modatex)
}
ion-text { font-size: 0.95rem; }
</style>