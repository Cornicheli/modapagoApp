<script setup lang="ts">
import { IonSearchbar, IonList, IonListHeader, IonItem, IonAvatar, IonLabel, modalController, isPlatform, onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import ModalSearchBrands from '@/components/Rapipago/ModalSearchBrands.vue';
import useRapipagoStore from '@/store/rapipago';
import appStore from '@/store/app';
import { loadRouteLocation, useRouter } from 'vue-router';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { runAlert, runLoader } from '@/libs';
import { arrowBackCircleSharp, arrowBackSharp, scan } from 'ionicons/icons';
import { ScreenOrientation } from '@capacitor/screen-orientation'



const store = useRapipagoStore()
const global = appStore()

const rechargerBrands = ref<any>()
const basicBrands = ref<any>()

const router = useRouter()


const stopScan = async () => {
   
   await BarcodeScanner.showBackground();
   await BarcodeScanner.stopScan();

   await ScreenOrientation.lock({ orientation: 'portrait' });

   global.scannerActive = false;
}

const startScan = async () => {
  
  await BarcodeScanner.checkPermission({ force: true });

  await ScreenOrientation.unlock();
  await ScreenOrientation.lock({ orientation: 'landscape' });
  
  await BarcodeScanner.hideBackground();
  
  global.scannerActive = true;
  
  const result = await BarcodeScanner.startScan({
   targetedFormats : [
      SupportedFormat.AZTEC,
      SupportedFormat.CODABAR,
      SupportedFormat.CODE_128,
      SupportedFormat.CODE_39,
      SupportedFormat.CODE_39_MOD_43,
      SupportedFormat.CODE_93,
      SupportedFormat.EAN_13,
      SupportedFormat.EAN_8,
      SupportedFormat.ITF,
      SupportedFormat.ITF_14,
      SupportedFormat.MAXICODE,
      SupportedFormat.PDF_417,
      SupportedFormat.RSS_14,
      SupportedFormat.RSS_EXPANDED,
      SupportedFormat.UPC_A,
      SupportedFormat.UPC_E,
      SupportedFormat.UPC_EAN_EXTENSION
   ],
   cameraDirection:'back'
  }); 
  if (result.hasContent) {
      
      const barra = result.content.toString();

      try {

         await store.buscarFacturaxBarra(barra);
         
      } catch (error) {
         
         await runAlert("No se encontraron resultados, intente nuevamente o pruebe con la búsqueda manual.");

      } finally {

         await stopScan();
      }
  } else {
      runAlert("No se encontró contenido en la factura.");
  }

  stopScan();

};

const getPopularCompanies = async () => {

   const http = await store.http.get('company/popular/list', {
      params : {
         rapipago_token : store.authToken 
      }
   })

   const data = await http.data;

   if(data.servicios) {
      basicBrands.value = data.servicios.map( ( item: any ) => {
         return {
            code : item.company_code,
            icon_code : item.id,
            name : item.name
         }
      })
   }

   if(data.recargables) { 
      rechargerBrands.value = data.recargables.map( ( item: any ) => {
         return {
            code : item.code,
            icon_code : item.code,
            name : item.name,
            form : item.form,
            paymentModeId : item.paymentModeId
         }
      })
   }
   
   console.log(data);
   
}

const openSearchModal = async () => {
   const modal = await modalController.create({
      component: ModalSearchBrands
   });

   modal.present()
}

const crearFormulariosPrepago = async (empresa: any) => {

   await store.getToken()

   for (let i = 0; i < empresa.form.length; i++) 
   {                

      const element = empresa.form[i];
      
      if (element.component != 'LABEL') 
      {                    
         element.value = null;
      }

      empresa.form[i] = element;                

   }

   localStorage.setItem('form_recarga', JSON.stringify(empresa));

   return await router.replace({ 
      path : `/app/rapipago/prepaid/prepare/${empresa.code}/${encodeURI(empresa.name.replace('/', '-'))}`,
   });

}

onIonViewWillEnter( async () => {   
   await store.getToken()
   await getPopularCompanies()
})

onIonViewWillLeave( async () => {
   await stopScan();
})




</script> 

<style>
.btn-scanner { height: auto; }
.btn-scanner div { padding: 8px 0;}
.btn-scanner * { display: block;  color: blue; font-size: 0.85rem; }
.buscador-empresas { padding: 3px; }
</style>


<template>
   <ion-page>
      <ion-content class="secondary" fullscreen style="position: relative;" v-if="!global.isScannerActive"> 
         <ion-grid>
            <ion-row>
               <ion-col size="12" class="rapi-section">
                  <ion-button expand="block" color="light" class="btn-scanner" @click="startScan" :disabled="(isPlatform('ios') || isPlatform('android')) ? false : true">
                     <div>
                        <img src="/img/rapipago/bars-img.png" alt="Scanner cod de barras" />
                        <ion-text>ESCANEAR FACTURA</ion-text>
                     </div>
                  </ion-button>
               </ion-col>
               <ion-col size="12" class="rapi-section">
                  <ion-searchbar class="buscador-empresas" placeholder="Buscá tu empresá acá..." @ion-click="openSearchModal" @ion-focus="openSearchModal"/>
               </ion-col>
               <ion-col size="12">
                 <ion-list>
                     <ion-list-header style="font-weight: 500;">Pagá tus servicios:</ion-list-header>
                     <ion-item lines="full" v-if="!basicBrands" v-for="n of 6">
                        <IonAvatar slot="start">
                           <skeleton animated style="border-radius: 100%;" />
                        </IonAvatar>
                        <IonLabel>
                           <skeleton animated />
                           <skeleton animated style="width: 80%;" />
                        </IonLabel>
                     </ion-item>
                     <ion-item :lines="(i < basicBrands.length-1) ? 'full' : 'none'" v-else v-for="(brand, i) in basicBrands" @click="store.goToSearchForms(brand)">
                        <IonAvatar slot="start">
                           <img :src="`/img/rapipago/logos/icon-${brand.icon_code}-circle.png`" :alt="brand.name" style="border-radius: 100%" />
                        </IonAvatar>
                        <IonLabel style="font-size: 0.85rem;">
                           {{  brand.name  }}
                        </IonLabel>
                     </ion-item>
                 </ion-list>
               </ion-col>               
               <ion-col size="12">
                 <ion-list>
                     <ion-list-header style="font-weight: 500;">Cargá saldo:</ion-list-header>
                     <ion-item lines="full" v-if="!rechargerBrands" v-for="n of 6">
                        <IonAvatar slot="start">
                           <skeleton animated style="border-radius: 100%;" />
                        </IonAvatar>
                        <IonLabel>
                           <skeleton animated />
                           <skeleton animated style="width: 80%;" />
                        </IonLabel>
                     </ion-item>
                     <ion-item :lines="(i < rechargerBrands.length-1) ? 'full' : 'none'" v-else v-for="(brand, i) in rechargerBrands" @click="crearFormulariosPrepago(brand)">
                        <IonAvatar slot="start">
                           <img :src="`/img/rapipago/logos/recargas/icon-${brand.code}-circle.png`" :alt="brand.name" style="border-radius: 100%" />
                        </IonAvatar>
                        <IonLabel style="font-size: 0.85rem;">
                           {{  brand.name  }}
                        </IonLabel>
                     </ion-item> 
                 </ion-list>
               </ion-col>
            </ion-row>
         </ion-grid>
      </ion-content>
      <ion-content fullscreen style="position:relative; --background: transparent;" v-else>
         <ion-button color="light" fill="outline" class="cancelScan" @click="stopScan">
            <ion-icon :icon="arrowBackSharp" style="margin-right: 10px;"></ion-icon>
            Volver
         </ion-button>
         <div class="scanOverlayCustom"></div>
      </ion-content>
   </ion-page>
</template>