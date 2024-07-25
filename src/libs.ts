import { alertController, loadingController, modalController, toastController } from '@ionic/vue'
import axios, { AxiosError } from 'axios'
import moment from 'moment'


const parseDate = (value: string) => {
   return moment(value,'YYYY/MM/DD HH:mm a').format('DD/MM/YYYY hh:mm A');
}


const http = axios.create({
   baseURL : import.meta.env.VITE_APP_MODAAPI_URL,
   method : 'GET'
})


http.interceptors.request.use(config => {         

   const token = localStorage.getItem('token');

   if(typeof token !== 'undefined' && token !== null && token != 'undefined')
   {
      config.params = { token: token, ...config.params }
   }

   return config

}, error => {

   return Promise.reject(error)
})

http.interceptors.response.use( response => response, (error: AxiosError) => {

   if(error.code == 'ECONNABORTED' || error.code == 'ERR_NETWORK' || error.code == 'ETIMEDOUT'){ 
      
      runAlert('La operación no se pudo completar, revisá tu conexión a internet.')

   } else if (error.response && (error.response.status==401 || error.response.status == 403)) {
      
      localStorage.clear()
      localStorage.setItem('second_time', 'true')
      window.location.href="/login"
   }
   
   return Promise.reject(error)
})

const shopImage = ( groupName: any ) => { 
   return `http://netivooregon.s3.amazonaws.com/modatexrosa2/img/modatexrosa2/${groupName.toLowerCase()}.gif`
}

const notFoundShopImage = (event : any) => {
   event.target.src = '/img/logobroken.jpeg'
   return;
}



/**
 *  ------------ ALERT, TOAST, LOADINGS ----------
 *  
 *  Cargo los controladores para crear los elementos.
 */

const runAlert = async (message : any) => {
   const _alert = await alertController.create({ message, header: 'Aviso de Modapago:', buttons : ['Aceptar'] })
                  await _alert.present()
   return _alert;
}

const runToast = async (message: any) => {
   const _toast = await toastController.create({ message, duration: 3500, animated: true })
                  await _toast.present()
   return _toast;
}

const runLoader = async (message: any) => {
   const _loader = await loadingController.create({ message, animated: true, spinner: 'dots', showBackdrop: true })
                   await _loader.present()
   return _loader;
}


const setData = (k: string, v : any ) => {
         
   if (typeof v === 'object') {
      v = JSON.stringify(v)
   } 

   localStorage.setItem(k, v)
}

const getData = (k: string) => {
   
   const data = localStorage.getItem(k)

   try {

      const json = JSON.parse(String(data))

      return json;
      
   } catch (error) {
      
      return data;
   }

}


export { 
   http as axios, 
   shopImage,
   notFoundShopImage,
   runAlert,
   runToast,
   runLoader,
   setData,
   getData,
   parseDate
}