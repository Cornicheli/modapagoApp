<template>
  <ion-page>
    <ion-tabs>
      <ion-header v-if="!isScannerActive">
        <ion-toolbar color="modatex">          
          <ion-title style="font-size: 1.15rem;">{{route.meta.title}}</ion-title>
          <ion-buttons slot="end">
              <ion-button @click="ShowPopover($event)" color="light">
                  <ion-icon :icon="notificationsSharp"></ion-icon>
                  <div v-if="notificaciones > 0">
                      <ion-badge color="primary" v-text="notificaciones"></ion-badge>
                  </div>    
              </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-router-outlet @ionBackButton="killScanners"></ion-router-outlet>

      <ion-tab-bar slot="bottom" color="modapago" v-if="!isScannerActive">
        <ion-tab-button  @click="forceRouting({name: 'app.home'})" tab="home">
          <ion-icon aria-hidden="true" :icon="personCircleSharp" />          
        </ion-tab-button>

        <ion-tab-button  :disabled="isItemActive"  @click="forceRouting({name: 'app.transfer'})" tab="transfer">
          <ion-icon aria-hidden="true" :icon="arrowUpSharp" />          
        </ion-tab-button>

        <ion-tab-button  :disabled="isItemActive"  @click="forceRouting({name: 'app.history'})" tab="history">
          <ion-icon aria-hidden="true" :icon="clipboardSharp" />          
        </ion-tab-button>

        <!-- ion-tab-button  :disabled="(!globalStore.inAccount) ? true : false"  @click="forceRouting('/app/rapipago/home')" tab="home">
          <ion-img src="/img/rapipago.png" style="width: 80px; opacity:0.8"/>
        </ion-tab-button -->        
        <ion-tab-button :disabled="isItemActive" @click="forceRouting({ name: 'pagofacil' })" tab="pagofacil">
          <IonLabel>Pagofacil</IonLabel>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page> 
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonImg, modalController, IonText, IonLabel } from '@ionic/vue';
import { arrowBack, arrowBackSharp, arrowUpSharp, clipboardSharp, ellipse, notificationsSharp, personCircleSharp, square, triangle } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter} from 'vue-router';
import NotificationPage from './NotificationPage.vue';
import appStore from '@/store/app';
import usePagofaciStore from '@/store/pagofacil';

const route = useRoute()
const router = useRouter()

const isItemActive = computed( () => ( (!globalStore.inAccount) ? true : false ) )

const notificaciones = ref(0)
const array = ref('')
const notification_interval = ref()

const globalStore = appStore()
const pagofacilStore = usePagofaciStore()


const isScannerActive = computed( () => {
  return ( ( globalStore.isScannerActive || pagofacilStore.isScannerOpen ) ? true : false );
})


const handleModalDismiss = () => {
    
    var redirect = localStorage.getItem('redirect');

    switch (redirect) {
        
        case 'transference':
              router.push({name: 'Transferencias'}); 
            break;

        case 'coupon':
              router.push({name: 'Movimientos'}); 
            break;

        default:

            break;
    }
    localStorage.removeItem('redirect');
}


const ShowPopover = async (event: any) => {
    const popover = await modalController.create({
          component: NotificationPage,
          componentProps: {
              data:
              {
                  count: notificaciones.value,
                  notifications : array.value
              }
          }
      });

    popover.onDidDismiss().then(() => handleModalDismiss());

    return await popover.present();
}


const UpdateNotifications = () => {

  if(localStorage.Notifications == '[]' || localStorage.Notifications == '' || typeof localStorage.Notifications === 'undefined'){
        array.value = '';
        notificaciones.value = 0;
      return;
  }

  let notificacions = JSON.parse(localStorage.Notifications);

  array.value = notificacions;
  notificaciones.value = Object.keys(notificacions).map(i => notificacions[i]).length;
}

const goBack = () => router.go(-1) 

const forceRouting = ( location : string | object ) => {

  return router.push(location)
}

const visible = computed( () => {
  if(route.name != 'app.home')
    return 'block'
  
  return 'none'
})

const killScanners = () => {
  alert("test");
}


onMounted( () => {

  notification_interval.value = setInterval(UpdateNotifications,1000);

  if (typeof localStorage.Notifications !== 'undefined') {
    UpdateNotifications();
  }

})

</script>
