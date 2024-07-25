<script setup lang="ts">
import { runAlert } from '@/libs'
import appStore from '@/store/app'
import { onBeforeMount, ref } from 'vue'
import DiscountGrid from '@/components/DiscountGrid.vue'
import BasePage from '@/components/BasePage.vue'

const store = appStore()

const discounts = ref<any>(null)

const getDiscounts = async () => {
   
   try {

      const http = await store.authAxios().get('/descuentos')
      const {brands} = await http.data
      discounts.value = brands

   } catch (error) {

      runAlert('Error al listar los descuentos #1')
   }
}   

onBeforeMount( () => {
   getDiscounts()
})
</script>
<template>
   <ion-page>
      <base-page>
         <ion-content fullscreen>
            <discount-grid :items="discounts" :from-home="false" />
         </ion-content>
      </base-page>
   </ion-page>
</template>