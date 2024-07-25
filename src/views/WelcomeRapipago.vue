<template>
   <ion-page>
      <ion-content color="modapago" fullscreen>
         <swiper :modules="[Pagination]" :pagination="true">
            <swiper-slide v-for="(slide, i) in slides" :key="i">
               <ion-grid class="ion-padding">
                  <ion-row>
                     <ion-col size="6" offset="3">
                        <img :src="slide.icon" :alt="slide.title" style="width: 75%;" />
                     </ion-col>
                     <ion-col size="12" class="ion-margin-vertical">
                        <h2>
                           <span v-html="slide.title" />
                        </h2>
                     </ion-col>
                     <ion-col size="12">
                        <ion-text v-for="t of slide.text" style="display: block; margin: 10px 0;">{{ t }}</ion-text>
                     </ion-col>
                     <ion-col size="10" offset="1" v-if="slide.button">
                        <ion-button color="modatex" expand="block" shape="round" :router-link="slide.button.link">
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

type TSlides = {
   icon: string,
   title: string | undefined,
   text : string[] | undefined,
   button: { caption: string, link: string } | undefined
}

const slides = reactive<TSlides[]>([
   {
      icon: '/img/rapipago/slider/1.png',
      title: '<span style="color: #ff3399">Hey!</span> Tenemos una <br> <span style="color: #ff3399">gran novedad en esta app!</span>',
      text : undefined,
      button: undefined
   },
   {
      icon: '/img/rapipago/slider/2.png',
      title: `
         A partir de hoy <br>
            <span style="color: #ff3399">podés hacer pagos de servicios con tu saldo</span>
            <br>
         Modapago
      `,
      text : undefined,
      button: undefined
   },
   {
      icon: '/img/rapipago/slider/3.png',
      title: `
         Encontrá el logo de <br>
         <span style="color: #ff3399">Rapipago</span> y pagate <br>
         todo desde esta aplicación
      `,
      text : undefined,
      button: {
         link: '/',
         caption: 'Empezar'
      }
   }   
])

</script>

<style scoped>
.swiper {
   height: 100vh;
   --bullet-background: #FFFFFF;
   --bullet-background-active: var(--ion-color-modatex)
}
</style>