import { getData, runAlert, runLoader, runToast } from "@/libs"
import { BarcodeScanner } from "@capacitor-community/barcode-scanner"
import axios, { AxiosError, isAxiosError } from "axios"
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

const appStore = defineStore('app', () => {

   const router = useRouter()

   const token  = computed( () => {
      const value = localStorage.getItem('token')
      return value
   })


   const inAccount = ref<any>(undefined)
   const available = ref<any>(undefined)
   const toRelease = ref<any>(undefined)
   const user = ref<any>(undefined)
   const scannerActive = ref<boolean>(false);


   const stopScan = async () => {
   
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
   
      scannerActive.value = false;
   }

   const authAxios = () => { 
      
      const instance = axios.create({
         baseURL: import.meta.env.VITE_APP_MODAAPI_URL,
         method : 'GET'
      }) 
      

      instance.interceptors.request.use(config => {         

         const token = localStorage.getItem('token');

         if(typeof token !== 'undefined' && token !== null && token != 'undefined')
         {
            config.params = { token: token, ...config.params }
         }

         return config

      }, error => {

         return Promise.reject(error)
      })

      instance.interceptors.response.use( response => response, async (error: AxiosError) => {

         if(error.code == 'ECONNABORTED' || error.code == 'ERR_NETWORK' || error.code == 'ETIMEDOUT'){ 
            
            await runToast('La operación no se pudo completar, revisá tu conexión a internet.')
         }

         const status = Number(error.response?.status);

         if(status == 401 || status == 403)
            await logout()

         if(status >= 400 ) { 
            const data = Object(error.response?.data);
            await runToast( String(data.message + " - Si el problema persiste, reportarse a soporte@modapago.com") )
         }

         return Promise.reject(error)
      })

      return instance;
   }

   const logout = async () => {
      
      const loading = await runLoader('Cerrando sesion...')

      try {

         await axios.post(import.meta.env.VITE_APP_MODAAPI_URL + '/logout?token=' + getData('token') );         
         
      } catch (error) {

         console.log(error);
         
      } finally {

         loading.dismiss()

         inAccount.value = undefined
         available.value = undefined
         user.value = undefined
   
         localStorage.clear()
         localStorage.setItem('second_time', 'true')
         return router.replace({ name: 'login.page' })

      }

   }   

   const getBalance = async (onlyBalance: boolean = false) => {
   
      try {

         const extraParams = { params : {} }

         if (onlyBalance) {
            extraParams.params = {
               tipo: 'balance'
            }
         }

         const http = await authAxios().get('/balance', extraParams)
         const data = await http.data
   
         //delete data.user.owner.requests;
         //delete data.brand.requests;         

         inAccount.value = data.in_account
         available.value = data.available
         user.value = data.user

         if(localStorage.FCM_TOKEN && ( !data.user.fcm_token || (data.user.fcm_token != localStorage.FCM_TOKEN)) ) {

            try {
      
      
               const resp_fcm = await authAxios().post('/firebase', {
                  fcm_token : localStorage.FCM_TOKEN
               })
      
               const data_fcm = await resp_fcm.data
      
               console.log('Token guardado >>> ', data_fcm);
               
               data.user.fcm_token = localStorage.FCM_TOKEN

            } catch (error) { 
               
               if (isAxiosError(error)) {
                  return await runAlert(error.response?.data.message)
               }
      
               return await runAlert(String(error))
      
            }
         }

         if(onlyBalance)
            toRelease.value = data.no_available

         localStorage.setItem('in_account', data.in_account)
         localStorage.setItem('available', data.available)
         localStorage.setItem('user', JSON.stringify(data.user))

         return data;
         
      } catch (error) {         
         
         runToast('Error al traer el balance, comuníquese con soporte@modapago.com')
      }

   }

   const isScannerActive = computed( () => scannerActive.value);

   return { token, authAxios, getBalance, inAccount, available, user, toRelease, logout, scannerActive, isScannerActive, stopScan }
})

export default appStore