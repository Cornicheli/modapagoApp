<script setup lang="ts">
import appStore from '@/store/app'
import usePagofaciStore from '@/store/pagofacil';
import NotificationPage from '@/views/NotificationPage.vue';
import { IonBackButton, IonBadge, IonButton, IonButtons, IonHeader, IonIcon, IonTabBar, IonTabButton, IonTitle, IonToolbar, modalController } from '@ionic/vue';
import { arrowBackSharp, arrowUpSharp, clipboardSharp, notificationsSharp, personCircleSharp } from 'ionicons/icons'
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const globalStore = appStore();
const pagofacilStore = usePagofaciStore()
const notificaciones = ref<any>("");
const array = ref<any>([]);
const visible = ref<boolean>(true);
const route = useRoute();
const router = useRouter();
const notification_interval = ref<any>(undefined);

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

  return router.replace(location)
}


const isScannerActive = computed( () => {
  return ( ( globalStore.isScannerActive || pagofacilStore.isScannerOpen ) ? true : false );
})

onMounted( () => {

  notification_interval.value = setInterval(UpdateNotifications,1000);

  if (typeof localStorage.Notifications !== 'undefined') {
    UpdateNotifications();
  }

})

</script>
<template>
    <IonHeader v-if="!isScannerActive">
      <IonToolbar color="modatex">
        <IonBackButton slot="start" />
        <IonTitle style="font-size: 1.15rem;">{{route.meta.title}}</IonTitle>
        <IonButtons slot="end">
            <IonButton @click="ShowPopover($event)" color="light">
                <ion-icon :icon="notificationsSharp"></ion-icon>
                <div v-if="notificaciones > 0">
                    <IonBadge color="primary" v-text="notificaciones"></IonBadge>
                </div>    
            </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <slot />    
</template>
