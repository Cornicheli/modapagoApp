<script setup lang="ts">
import { arrowBackSharp, mailOpenSharp, qrCodeSharp, scan } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { ScannerError, RequestError } from '@/ModapagoExceptions'
import { axios, getData, runAlert, runLoader, runToast } from '@/libs';
import { ref } from 'vue';
import useTransferenceStore from '@/store/transferences';
import { IonImg, IonText, alertController, modalController, useBackButton } from '@ionic/vue';
import ConfirmTransference from './ConfirmTransference.vue';
import appStore from '@/store/app';
import usePagofaciStore from '@/store/pagofacil';
import ModatexTransferenceForm from '@/components/ModatexTransferenceForm.vue';

const transferStore = useTransferenceStore()
const router = useRouter()
const global = appStore();
const pagofacilStore = usePagofaciStore()

const props = defineProps({
   showModatexButton : { type: Boolean, default: false, required: false  }
})

type TQrValue = {
   amount : string|number,
   email : string
}

type TConfirmTransference = {
   amount : string|number,
   comments : string,
   destinatary : object
}

const redirectTo = (route: any) => {
   return router.push(route)
}


const confirmTranferenceModal = (form: TConfirmTransference) => {
   
   if(form.amount && Number(form.amount) > 0) {

      form.destinatary = transferStore.getDestinatary

      modalController.create({
         component : ConfirmTransference,
         componentProps : {
            transference: form
         }
      })
      .then( modal => modal.present() )

   } else {
      runToast('Ingrese un monto válido mayor a 0')
      return false
   }
}

const proceedToTransaction = async (values : string | TQrValue) => {

   console.log(values);
   

   const email = ref("")

   if(typeof values === 'string')
      email.value = values
   else if(typeof values === 'object')
      email.value = (values.email.includes('/')) ? values.email.split('/')[1] : values.email
   else
      return runAlert('QR Corrupto')
   
   const loader = await runLoader('Iniciando transacción, aguarde.')

   try {

      console.log("paramsToModal >>>>>", values);
      
      const http = await global.authAxios().get('/qr_mail', {
         params : {
            token : getData('token'),
            email : email.value
         }
      })

      const qrInfo = await http.data;

      transferStore.destinatary = qrInfo.brand

      if(typeof values === 'string') {

         return router.push({name:'app.transfer.checkout'})
      }

      const paramsToModal: TConfirmTransference = {
         amount: values.amount,
         comments : 'Pago con QR',
         destinatary: qrInfo.brand
      }      

      if (typeof values === 'object') {
         confirmTranferenceModal(paramsToModal)
      }

   } catch (error) {

      //runAlert(String(error))
      
   } finally {

      loader.dismiss()
   }
}

const startScan = async () => {
  
   const perm = await BarcodeScanner.checkPermission({force:true});      

   if( !perm.granted ) {

      const warnAlert = await alertController.create({ 
         message : 'Necesitamos acceso a tu camara para que puedas hacer uso del scanner. Activala desde "Permisos de aplicacion" > Camara > Permitir',
         buttons : [
            {
               text: 'Aceptar',
               handler : () => {
                  BarcodeScanner.openAppSettings();
               }
            },
            {
               text : 'Rechazar',
               handler : () => {
                  alertController.dismiss()
               }
            }
         ]
      });
      
      await warnAlert.present();

   } else { 

  
      await BarcodeScanner.hideBackground();
  
      global.scannerActive = true;
      
      const result = await BarcodeScanner.startScan({
            targetedFormats : [
               SupportedFormat.QR_CODE, SupportedFormat.DATA_MATRIX
            ]
      }); 

      if (result.hasContent) {      
            
            const barra = result.content.toString();

            try {

               if(result.hasContent) {
               
                  const qrContent = result.content;

                  if (qrContent.startsWith('{')) {

                     const parsed = JSON.parse(qrContent)

                     await proceedToTransaction(parsed)

                     global.stopScan();

                  } else if (qrContent.startsWith('www.modapago.com.ar/')) {


                     const parsed = qrContent.split('/')[1];

                     await proceedToTransaction(parsed)

                     global.stopScan();

                  } else {

                     throw new ScannerError("El QR es inválido");
                  }
               }         
               
            } catch (error) {
               
               runAlert("Hubo un error al intentar el proceso de pago, intente nuevamente.");

            } finally {

               global.stopScan();
            }
      } else {

            runAlert("Error en el scanner, comuniquese con soporte@modapago.com");
      }

      global.stopScan();

   }

};


const openModatexTransferenceForm = async () => {
   const form = await modalController.create({
      component: ModatexTransferenceForm
   });
   form.present()
}
</script>
<style scoped>
.borders {
   min-height: 115px;
}
ion-img, ion-icon {
   font-size: 2.5rem;
}

ion-img, ion-icon+p, ion-img+p, ion-text {
   font-size: 0.82rem;
}
</style>
<template>
   <ion-grid>
         <ion-row class="ion-text-center">
            <ion-col :size="(!props.showModatexButton) ? 6 : 4" style="padding: 5px;" @click="startScan">
               <div class="borders" style="padding: 20px 5px 10px;">
                  <ion-icon :icon="qrCodeSharp" />
                  <p>
                     Código QR
                  </p>
               </div>
            </ion-col>
            <ion-col :size="(!props.showModatexButton) ? 6 : 4" style="padding: 5px;" @click="redirectTo({ name: 'app.transfer.email' })">
               <div class="borders" style="padding: 15px 5px 0px;">
                  <ion-icon :icon="mailOpenSharp" color="danger" />
                  <p>
                     Correo electrónico
                  </p>
               </div>
            </ion-col>
            <ion-col size="4" style="padding: 5px;" @click="openModatexTransferenceForm" v-if="props.showModatexButton">
               <div class="borders" style="padding: 8px 5px 7px;">
                  <IonImg src="/img/icon-moda-app.png" style="width: 65px; height: 65px; margin:auto;" />
                  <IonText>Transferir a Modatex</IonText>   
               </div>
            </ion-col>
         </ion-row>
   </ion-grid>
</template>