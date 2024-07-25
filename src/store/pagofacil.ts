import { getData, runAlert, runLoader, axios, runToast } from "@/libs";
import { useRouter } from "vue-router";
import { alertController, isPlatform, modalController } from "@ionic/vue";
import { AxiosError, isAxiosError } from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { ScreenOrientation } from '@capacitor/screen-orientation'

const usePagofaciStore = defineStore('pagoacil', () => {

   const router  = useRouter()
   const company = ref()
   const invoice = ref()
   const ticket  = ref()
   const isScannerOpen = ref(false)
   const codigoBarras = ref()
   const barcodeAdditionalData = ref<any>([])

   const startScan = async () => {

      const perm = await BarcodeScanner.checkPermission({ force: true });

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
         
         if (isPlatform('iphone') || isPlatform('ios')) {
      
            await ScreenOrientation.lock({ orientation : 'landscape-primary' })
                     
         } else {
            
            await ScreenOrientation.lock({ orientation : 'landscape' })
         }
         
         await BarcodeScanner.hideBackground();
   
         isScannerOpen.value = true
   
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
         
               const loader = await runLoader('Buscando resultados, aguarde. Barra: ' + barra);
   
               try {
         
   
                  const resp = await axios.post(`${import.meta.env.VITE_APP_PAGOFACIL_URL}/operation/barcode/prepare?token=${getData('token')}`, {
                     codigoBarras : barra.trim()
                  })
   
                  const data = await resp.data;
                  const { api_response, api_status } = data;
                  let baseValor : string|number = ""
                  
                  if (api_status == 200) {   
                     
                     if(api_response.importeVariable && api_response.importe === null) {
                        api_response.importe = 0;
                     }

                     if(api_response.importeVariable) {

                        baseValor = api_response.importe                                 

                     }

                     codigoBarras.value = barra
                     barcodeAdditionalData.value = [{
                        descripcion : api_response.descripcion,
                        valor : baseValor,
                        ordinal : 1,
                        visible : true,
                        importeVariable : api_response.importeVariable,
                        importeMinimo : api_response.importeMinimo,
                        importeMaximo : api_response.importeMaximo,
                        importe : api_response.importe,
                        opciones : api_response.opciones
                     }]
   
                     await runToast("Vamos a pedirte algunos datos adicionales.")
                     return await router.push({  name : 'pagofacil.barcode.invoice.find' })
                  }
   
                  if(api_status == 201) {
   
                     console.log('entra aca >> ', api_status);
                     
                     invoice.value = api_response
                     return await router.push({ name : 'pagofacil.barcode.invoice'})
                  }
                  
                  if(api_status == 500)
                     throw new Error(api_response.message);
                  
   
                  
               } catch (error) {
   
                  if(isAxiosError(error))
                     await runAlert(error.response?.data.message);
                  else
                     await runAlert(String(error));
         
               } finally {
         
                  await loader.dismiss()
                  return await stopScan();
               }
   
           } else {
   
               await runAlert("No pudimos leer correctamente la factura, intenta nuevamente.");
   
               return await stopScan()
           }
      }
   }

   const stopScan = async () => {

      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
      await ScreenOrientation.lock({ orientation: 'portrait' });
      
      isScannerOpen.value = false
   }
 
   const findInvoicePage = async (item: any, fromModal = false) => {

      company.value = item;
      item.forms = JSON.parse(item.forms)

      if (fromModal) 
         await modalController.dismiss()
      
      return await router.push({ name: 'pagofacil.invoice.find' })
   }

   return { 
      company, 
      findInvoicePage, 
      invoice, 
      ticket, 
      isScannerOpen, 
      startScan, 
      stopScan, 
      codigoBarras, 
      barcodeAdditionalData 
   }
})

export default usePagofaciStore