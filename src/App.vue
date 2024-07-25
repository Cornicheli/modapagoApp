<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>
<script setup lang="ts">
import { IonApp, IonRouterOutlet, onIonViewDidLeave, onIonViewWillEnter, useBackButton } from '@ionic/vue'
import appStore from './store/app';
import usePagofaciStore from './store/pagofacil';
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';
import { runToast } from './libs';
import { App } from '@capacitor/app';

const globalStore = appStore()
const pagofacilStore = usePagofaciStore()
const route = useRoute()
const router = useRouter()
const exitCounter = ref(1)


useBackButton( -1, () => {
  
  if(globalStore.isScannerActive || pagofacilStore.isScannerOpen) {
    exitCounter.value = 1;
    pagofacilStore.stopScan()
    globalStore.stopScan()
    return;
  }

  switch(route.name) {
    case 'app.home':            
          App.exitApp()         
      break;
    default:
        exitCounter.value = 1
      break;
  }

})

onIonViewWillEnter( () => {
  exitCounter.value = 1
})
onIonViewDidLeave( () => {
  exitCounter.value = 1
})

</script>
<style>
ion-list-header { align-items: center !important; font-size: 1.01rem !important; }
</style>