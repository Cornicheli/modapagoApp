import { createRouter, createWebHistory } from '@ionic/vue-router';
import { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import WelcomeVue from '@/views/Welcome.vue'
import Shops from '@/views/Shops.vue'
import RapipagoWelcomeVue from '@/views/WelcomeRapipago.vue'
import Login from '@/views/Login.vue'
import RecoverPassword from '@/views/RecoverPassword.vue'
import Home from '@/views/Home.vue'
import Discounts from '@/views/Discounts.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import QrCharge from '@/views/QrCharge.vue'
import TransferencePage from '@/views/TransferencePage.vue'
import TransferByEmail from '@/views/TransferByEmail.vue'
import CheckoutTransference from '@/views/CheckoutTransference.vue'
import Balance from '@/views/Balance.vue'
import History from '@/views/History.vue'

/** >>>>>>>>>>>>>>>>>> Vistas y componentes exclusivos de rapipago */

import RapipagoHome from '@/views/rapipago/Home.vue'
import RapipagoInvoiceSearchForms from '@/views/rapipago/InvoiceSearchForms.vue'
import RapipagoInvoices from '@/views/rapipago/Invoices.vue'
import PaymentPage from '@/views/rapipago/PaymentPage.vue'
import RapipagoPaymentCabPage from '@/views/rapipago/PaymentCabPage.vue'
import RapipagoTicketPage from '@/views/rapipago/TicketPage.vue'
import PreparePrepaidPageVue from '@/views/rapipago/PreparePrepaidPage.vue'
import RapipagoBarcodeCollision from '@/views/rapipago/BarcodeCollision.vue'
import ForceUpdateModal from '@/components/ForceUpdateModal.vue'

/** >>>>>>>>>>>>>>>>> Modulo de pago facil */

import { axios, getData } from '@/libs';
import { isPlatform, loadingController, modalController } from '@ionic/vue';

/** <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/app/home'
  },
  {
    path: '/welcome',
    name: 'welcome.page',
    component : WelcomeVue
  },
  {
    path: '/shops',
    name: 'shops.page',
    component : Shops
  },  
  {
    path: '/rapipago/welcome',
    name: 'rapipago.welcome.page',
    component : RapipagoWelcomeVue
  },
  {
    path: '/login',
    name: 'login.page',
    component : Login
  },
  {
    path: '/recover/password',
    name: 'recover.password.page',
    component : RecoverPassword
  },   
  {
    path : '/app/discounts',
    name : 'app.discounts',
    meta : { title : 'Descuentos' },
    component : Discounts
  },
  {
    path : '/app/balance',
    name : 'app.balance',
    meta : { title: 'Balance' },
    component : Balance
  },
  {
    path : '/app/money/request',
    name : 'money.request',
    meta : { title: 'Solicitud de retiro' },
    component : () => import("@/views/ExtractMoney.vue")
  },
  {
    path : '/app/password/change',
    name : 'app.password.change',
    meta : { title : 'Contraseña' },
    component : ChangePassword
  },  
  {
    path : '/app/qr/charge',
    name : 'app.qr.charge',
    meta : { title : 'Cobrar con QR' },
    component : QrCharge
  },
  {
    path : '/app/transfer/email',
    name : 'app.transfer.email',
    meta : { title : 'Enviar por correo' },
    component : TransferByEmail
  },
  {
    path : '/app/transfer/checkout',
    name : 'app.transfer.checkout',
    meta : { title : 'Transferencia' },
    component : CheckoutTransference
  },  
  {
    path : '/app/rapipago/invoice/search/:companyId/:companyName',
    name : 'app.rapipago.invoice.search',
    meta : { title: 'Buscar vencimientos' },
    component : RapipagoInvoiceSearchForms
  },     
  {
    path : '/app/rapipago/invoices/:companyId/:companyName',
    name : 'app.rapipago.invoices',
    meta : { title : 'Próximos vencimientos' },
    component : RapipagoInvoices
  },
  {
    path : '/app/rapipago/payment/:companyId/:companyName/:vencimientoId',
    name : 'app.rapipago.pay',
    meta : { title: 'Finalizar Pago' },
    component : PaymentPage
  },
  {
    path : '/app/rapipago/ticket/:transferenceId',
    name : 'app.rapipago.ticket',
    meta : { title: 'Comprobante de pago' },
    component : RapipagoTicketPage
  },
  {
    path : '/app/rapipago/payment/cab/:companyId/:companyName',
    name : 'app.rapipago.cab-payment',
    meta : { title: 'Comprobante de pago' },
    component : RapipagoPaymentCabPage
  },
  {
    path : '/app/rapipago/prepaid/prepare/:companyId/:companyName', 
    name : 'app.rapipago.prepaid-payment',
    meta : { title: 'Preparación de recarga' },
    component : PreparePrepaidPageVue
  },
  {
    path : '/app/rapipago/barcode/collision',
    name : 'app.rapipago.barcode.collision',
    meta : { title : 'Seleccione empresa' },
    component : RapipagoBarcodeCollision
  },  
  {
    path : '/app/pagofacil/invoice/find',
    name : 'pagofacil.invoice.find',
    meta : { title: 'Sucursal virtual' },
    component : () => import('@/views/PagoFacil/FindInvoice.vue')
  },
  {
    path : '/app/pagofacil/barcode/invoice/find',
    name : 'pagofacil.barcode.invoice.find',
    meta : { title: 'Sucursal virtual' },
    component : () => import('@/views/PagoFacil/Barcode/FindInvoice.vue')
  },  
  {
    path : '/app/pagofacil/invoices',
    name : 'pagofacil.invoices',
    meta : { title: 'Sucursal virtual - Vencimientos' },
    component : () => import('@/views/PagoFacil/Invoices.vue')
  },  
  {
    path : '/app/pagofacil/barcode/invoice',
    name : 'pagofacil.barcode.invoice',
    meta : { title: 'Sucursal virtual - Vencimientos' },
    component : () => import('@/views/PagoFacil/Barcode/Invoice.vue')
  },     
  {
    path : '/app/pagofacil/payment/pending',
    name : 'pagofacil.payment.pending',
    meta : { title: 'Sucursal virtual - Pago pendiente' },
    component : () => import('@/views/PagoFacil/Page504.vue')
  }, 
  {
    path : '/app/pagofacil/ticket',
    name : 'pagofacil.ticket',
    meta : { title: 'Sucursal virtual - Comprobante de pago' },
    component : () => import('@/views/PagoFacil/TicketPage.vue')
  },      
  {
    path: '/app/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/app/home'
      },
      {
        path : 'home',
        name : 'app.home',
        meta : { title : 'Resumen' },
        component : Home
      },     
      {
        path : 'transfer',
        name : 'app.transfer',
        meta : { title : 'Transferir' },
        component : TransferencePage
      },      
      {
        path : 'history',
        name : 'app.history',
        meta : { title : 'Actividad' },
        component : History
      },
      {
        path: 'rapipago',
        redirect: '/app/rapipago/home'
      },
      {
        path : 'rapipago/home',
        name : 'app.rapipago.home',
        meta : { title: 'Rapipago' },
        component : RapipagoHome
      },
      {
        path : 'pagofacil',
        name : 'pagofacil',
        meta : { title: 'Pago de servicios'},
        component : () => import('@/views/PagoFacil/Home.vue')
      }  
    ]
  }
]

import { App } from '@capacitor/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


const checkAppUpdates = async () => {



  let versionNumber = import.meta.env.VITE_APP_VERSION_CODE
  

  if(!getData('token') || typeof getData('token') === 'undefined' || import.meta.env.VITE_APP_MODE !== 'production')
    return false;


  let platformType = 0;

  if (isPlatform('ios')) {

    platformType = 2
    
  } else if (isPlatform('android')) {

    platformType = 1
  } 

  if (platformType != 0) {
    
    const http = await axios.get('check-app-updates', {
      params : {
        device_id: platformType
      }
    })
    
    const response = await http.data

    const { compatibility, description, version_code } = response

    if(!compatibility.length)
      return false;

    if( compatibility[0].platform && version_code > versionNumber || (typeof versionNumber === 'undefined')) {

      loadingController.dismiss()
      modalController.dismiss()

      const message = await modalController.create({
        backdropDismiss: false,
        canDismiss: false,
        component: ForceUpdateModal,
        componentProps : {
          detail : compatibility[0],
          versionCode : version_code
        }
      });

      await message.present()

    }

  }

}

const routesWithoutGuard = ["/welcome", "/shops", "/rapipago/welcome", "/login", "/recover/password"]

router.beforeEach( async (to,from,next) => {
  if(!routesWithoutGuard.includes(to.path)) {
    if(!localStorage.getItem('token')) {
      if(!localStorage.getItem('second_time'))
      {
        return next({name:'welcome.page'})
      } else {
        return next({name:'login.page'})
      }
    } else {
      
      checkAppUpdates()
      return next()
    }
  } else {
    if(localStorage.getItem("token")) {
      return next({ name : "app.home"})
    }
    if(localStorage.getItem('token')) {
      return next({name:'app.home'})
    } else {
      return next()
    }
  }
})

export default router
