<script setup lang="ts">
import { axios, shopImage, notFoundShopImage } from '@/libs';
import { onBeforeMount, ref } from 'vue';

const shops = ref()

const getShops = async () => {
   const http = await axios.get('/brands')
   const {brands} = await http.data;
   shops.value = brands
}

onBeforeMount( () => {
   getShops()
})
</script>
<template>
   <ion-page>
      <ion-header translucent>
         <ion-toolbar>
            <ion-back-button slot="start" />
            <ion-title>Comercios afiliados</ion-title>
         </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
         <ion-grid>
            <ion-row>
               <ion-col size="4" v-if="!shops" v-for="n of 12">
                  <skeleton animated style="height: 100px;" />
               </ion-col>
               <ion-col size="4" v-else v-for="shop of shops">
                  <img :src="shopImage(shop.group_name)" :alt="shop.group_name" @error="notFoundShopImage($event)" /> 
               </ion-col>
            </ion-row>
         </ion-grid>
      </ion-content>
   </ion-page>
</template>