import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { IonBackButton, IonBadge, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonSearchbar, IonSelect, IonSelectOption, IonSkeletonText, IonText, IonTitle, IonToolbar, IonicVue } from '@ionic/vue'

import { createPinia } from 'pinia'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import PushNotificationService from './services/PushNotificationService'
const pushNotificationService = new PushNotificationService()

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia())
  .component('ion-page', IonPage)
  .component('ion-badge', IonBadge)
  .component('ion-content', IonContent)
  .component('ion-grid', IonGrid)
  .component('ion-row', IonRow)
  .component('ion-col', IonCol)
  .component('ion-button', IonButton)
  .component('ion-input', IonInput)
  .component('ion-item', IonItem)
  .component('ion-back-button', IonBackButton)
  .component('ion-icon', IonIcon)
  .component('ion-label', IonLabel)
  .component('ion-text', IonText)
  .component('ion-toolbar', IonToolbar)
  .component('ion-header', IonHeader)
  .component('ion-buttons', IonButtons)
  .component('ion-title', IonTitle)
  .component('ion-list', IonList)
  .component('ion-list-header', IonListHeader)
  .component('skeleton', IonSkeletonText)
  .component('fa-icon', FontAwesomeIcon)
  .component('ion-img', IonImg)
  .component('ion-searchbar', IonSearchbar)
  .component('ion-select', IonSelect)
  .component('ion-select-option', IonSelectOption)
  
router.isReady()
.then(() => {
  app.mount('#app');
})
.then(async () => {
  await pushNotificationService.initWorker()
})