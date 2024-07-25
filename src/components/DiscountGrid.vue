<script setup lang="ts">
import { modalController } from '@ionic/vue';
import DiscountDetail from './DiscountDetail.vue';

defineProps<{ items: any, fromHome: boolean }>()

const viewDiscount = ( item: any ) => {
   modalController.create({
      component: DiscountDetail,
      componentProps : { item }
   })
   .then( modal => modal.present() )
}
</script>
<template>
   <ion-grid>
      <ion-row class="ion-align-items-center ion-text-center">
         <ion-col size="6" style="padding:10px" v-if="!items" v-for="n of 12">
            <skeleton animated style="height: 48px" />            
         </ion-col>
         <ion-col v-else v-for="item of items" size="6" style="padding: 5px;" @click="viewDiscount(item)">
            <div class="borders">
               <ion-row class="ion-align-items-center" style="min-height: 150px;">
                  <ion-col size="12">
                     <b>{{ item.local?.name }}</b>
                  </ion-col>
                  <ion-col size="12">
                     <ion-badge color="secondary">{{ item.discount.percentage }}%</ion-badge>
                  </ion-col>
                  <ion-col size="12">
                     <i>{{ (!item.local?.address) ? 'Sin direccion' : item.local?.address  }}</i>
                  </ion-col>
               </ion-row>               
            </div>
         </ion-col>
      </ion-row>
      <ion-row v-if="fromHome">
         <ion-col size="12">
            <router-link :to="{ name: 'app.discounts' }" exact>
               <ion-item detail lines="none">
                  Ver mas descuentos
               </ion-item>
            </router-link>
         </ion-col>
      </ion-row>
   </ion-grid>
</template>
<style scoped>
.borders { padding: 5px;}
a, a ion-item { text-decoration: none; --color: var(--ion-item-secondary);  --detail-icon-opacity: 0.8 }
</style>