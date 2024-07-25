<template>
   <ion-page>
      <ion-content color="modapago" fullscreen>
         <swiper :modules="[Pagination]" :pagination="true">
            <swiper-slide v-for="(slide, i) in slides" :key="i">
               <ion-grid class="ion-padding">
                  <ion-row>
                     <ion-col size="6" offset="3">
                        <img :src="slide.icon" :alt="slide.title" style="width: 150px;" />
                     </ion-col>
                     <ion-col size="12" class="ion-margin-vertical">
                        <h3>{{ slide.title }}</h3>
                     </ion-col>
                     <ion-col size="12">
                        <ion-text v-for="t of slide.text" style="display: block; margin: 10px 0;">{{ t }}</ion-text>
                     </ion-col>
                     <ion-col size="10" offset="1" v-if="slide.button">
                        <ion-button color="modatex" expand="block" shape="round" :router-link="slide.button.link" v-if="!slide.button.forceRouting">
                           {{ slide.button.caption }}
                        </ion-button>
                        <ion-button color="modatex" expand="block" shape="round" @click="forceRoute(slide.button.link)" v-else>
                           {{ slide.button.caption }}
                        </ion-button>
                     </ion-col>
                  </ion-row>
               </ion-grid>
            </swiper-slide>
         </swiper>         
      </ion-content>
   </ion-page>
</template>
<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import '@ionic/vue/css/ionic-swiper.css';
import { reactive } from 'vue';
import { useIonRouter } from '@ionic/vue';

const router = useIonRouter()

type TSlides = {
   icon: string,
   title: string | undefined,
   text : string[] | undefined,
   button: { caption: string, link: string, forceRouting : boolean } | undefined
}

const slides = reactive<TSlides[]>([
   {
      icon: '/img/logo_slider.png',
      title: 'Modapago',
      text : [
         'Paga tus compras de todos los dias con tu dinero en Modapago. Cientos de comercios de la zona ya aceptan pagos con esta billetera virtual.'
      ],
      button: undefined
   },
   {
      icon: '/img/store_slider.png',
      title: 'Comercios adheridos',
      text : [
         'No solo podes retirar el dinero. Ahora tambien pagar en los comercios de la zona.'
      ],
      button: {
         link: '/shops',
         caption: 'Ver comercios',
         forceRouting : false
      }
   },
   {
      icon: '/img/modapago-3.png',
      title: '¿Todo listo?',
      text : [
         'Desde aca podes ver tu balance, el historial de transferencias, ventas dentro de Modatex y tambien enviar dinero mediante codigo QR.',
         'Si estas listo, pulsá empezar para iniciar sesión en Modapago.'
      ],
      button: {
         link: '/login',
         caption: 'Empezar',
         forceRouting : true
      }
   }   
])

const forceRoute = ( path: string ) => {
   router.replace(path);
}

</script>

<style scoped>
.swiper {
   height: 100vh;
   --bullet-background: #FFFFFF;
   --bullet-background-active: var(--ion-color-modatex)
}
ion-text { font-size: 0.98rem; }
</style>