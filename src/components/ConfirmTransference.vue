<script setup lang="ts">
import { axios, notFoundShopImage, runAlert, runLoader, runToast, shopImage } from '@/libs';
import appStore from '@/store/app';
import useTransferenceStore from '@/store/transferences';
import { IonAvatar, modalController } from '@ionic/vue';
import { isAxiosError } from 'axios';
import { alarmSharp, cashSharp, checkmarkCircleSharp, close, closeCircleSharp, disc, discOutline, informationCircleSharp, lockClosedSharp } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = appStore()
const props = defineProps<{ transference: any }>()
const destinatary = computed(() => props.transference.destinatary)
const router = useRouter()
const transferStore = useTransferenceStore()


const operationId = ref()
const respuesta = ref("")

const finishTransaction = (redirect: boolean = false) => {
   modalController.dismiss().then(() => {
      if (redirect == true)
         return router.push('/')
   })
}

const hasDiscount = computed(() => {

   const dest = destinatary.value;

   if(dest.discount)
      return true;

   if(dest.category) {
      if(dest.category.promotion) {
         if(dest.category.promotion.discount) {
            return true;
         }
      } 
   }

   return false;
})

const discount = computed(() => {

   const dest = destinatary.value;
   if(dest.category) {
      if(dest.category.promotion) {
         if(dest.category.promotion.discount) {
            return dest.category.promotion.discount;
         }
      } 
   }

   return destinatary.value.discount;
})


const discountInfo = computed(() => {

   const amount = Number(props.transference.amount)
   const amountMaxPrice = Number(discount.value.max_price)
   const percentage = Number(discount.value.percentage)
   const percAmount = amount * (percentage/100)

   if (percAmount > amountMaxPrice)
      return amountMaxPrice

   return percAmount;
})

const subtotal = computed(() => {

   if (!hasDiscount)
      return 0;

   return Number(props.transference.amount) - Number(discountInfo.value);

})

const confirmAction = async () => {

   const loader = await runLoader('Transfiriendo, aguarde un momento...')

   try {

      const finalAmount = props.transference.amount;

      if (finalAmount > Number(store.available.join(".")))
         return runAlert('No posee saldo suficiente en cuenta.')

      const params = {
         token: localStorage.getItem('token'),
         amount: finalAmount,
         comment: (!props.transference.comments) ? '(Pago desde el celular)' : props.transference.comments,
         brand: destinatary.value.id,
         type: (destinatary.value.group_name && destinatary.value.group_name != "undefined") ? 'brand' : 'store'
      };

      console.log('params >> ', params);


      const http = await store.authAxios().post('/transference', params)
      const response = await http.data;

      respuesta.value = response.status;

      if (response.status == 'success') {
         operationId.value = response.id;
      }

   } catch (error) {

      console.log(error)

   } finally {

      loader.dismiss()
   }
}


</script>
<template>
   <div id="confirm-transference">
      <ion-header>
         <ion-toolbar>
            <ion-icon :icon="close" style="font-size: 2.1rem; margin-left: 10px;" slot="start"
               @click="finishTransaction(false)" />
            <ion-title>Resivá si está todo bien</ion-title>
         </ion-toolbar>
      </ion-header>
      <ion-grid>
         <ion-row v-if="respuesta == ''">
            <ion-col size="12">
               <ion-item lines="full">
                  <strong>Información del local</strong>
               </ion-item>
            </ion-col>
            <ion-col size="12">
               <ion-item lines="none">
                  <IonAvatar slot="start">
                     <img :src="shopImage(transferStore.shopName)" @error="notFoundShopImage" />
                  </IonAvatar>
                  <ion-label>
                     {{ transferStore.shopName }}
                     <br>
                     <p>
                        CUIT: {{ (destinatary.cuit) ? destinatary.cuit : '-' }}
                     </p>
                  </ion-label>
               </ion-item>
            </ion-col>
            <ion-col size="12">
               <ion-item lines="full">
                  <strong>Información del pago</strong>
               </ion-item>
            </ion-col>
            <ion-col size="12">
               <ion-item color="success" v-if="hasDiscount">
                  <ion-avatar slot="start">
                     <ion-icon :icon="informationCircleSharp" size="large" />
                  </ion-avatar>
                  <ion-label text-wrap>
                     <ion-text style="display: block; margin-bottom: 5px;">
                        Tenes un {{ Number(discount.percentage) }}% de descuento en esta operación.
                     </ion-text>
                     <ion-text class="ion-margin-top">
                        (Tope del descuento: ${{ Number(discount.max_price) }})
                     </ion-text>
                  </ion-label>
               </ion-item>
               <ion-item lines="full">
                  <template v-if="!discount">
                     <p>Monto: ${{ Number(transference.amount) }}</p>
                  </template>
                  <template v-else>
                     <ion-grid class="ion-no-padding">
                        <ion-row>
                           <ion-col class="ion-padding-bottom ion-padding-top" size="12">
                              <b>Subtotal:</b> ${{ Number(transference.amount) }}
                           </ion-col>
                           <ion-col class="ion-padding-bottom" size="12">
                              <b>Descuento ({{ Number(discount.percentage) }}%): </b> - ${{ discountInfo }}
                           </ion-col>
                           <ion-col class="ion-padding-bottom" size="12">
                              <b>Total:</b> ${{ subtotal }}
                           </ion-col>
                        </ion-row>
                     </ion-grid>
                  </template>
               </ion-item>
               <ion-item lines="full">
                  <p>Comentarios: {{ transference.comments || '-' }}</p>
               </ion-item>
               <ion-item color="danger" v-if="discount">
                  <ion-icon :icon="informationCircleSharp" size="large" slot="start"></ion-icon>
                  <p>Al confirmar la operacion no podras acceder a otro descuento hasta el dia siguiente.</p>
               </ion-item>
            </ion-col>
            <ion-col size="12">
               <ion-button color="modapago" expand="block" @click="confirmAction">Confirmar</ion-button>
            </ion-col>
         </ion-row>
         <ion-row v-else>
            <ion-col size="12" v-if="respuesta == 'success'">
               <ion-item lines="none">
                  <ion-text class="ion-text-center" :style="'width:100%'">
                     <p><ion-icon :icon="checkmarkCircleSharp" color="success" size="large"></ion-icon></p>
                     <h2>Operacion exitosa</h2>
                     <p>La transferencia se ha realizado exitosamente.</p>
                     <p>Numero de referencia <span v-text="'#' + operationId"></span></p>
                  </ion-text>
               </ion-item>
               <ion-button @click="finishTransaction(true)" expand="full" color="modapago">
                  <ion-label>Regresar al inicio</ion-label>
               </ion-button>
            </ion-col>
            <ion-col size="12" v-else-if="respuesta == 'ammount_too_high' || respuesta == 'problem_with_amount'">
               <ion-item lines="none">
                  <ion-text class="ion-text-center" :style="'width:100%'">
                     <p><ion-icon :icon="cashSharp" color="danger" size="large"></ion-icon></p>
                     <h2>Importe mayor</h2>
                     <p>La cantidad a enviar es mayor a la que tienes disponible.</p>
                     <p>Intenta nuevamente con una cantidad menor o igual a la disponible.</p>
                  </ion-text>
               </ion-item>
               <ion-button @click="finishTransaction" expand="full" color="primary">
                  <ion-label>Intentar de nuevo</ion-label>
               </ion-button>
            </ion-col>
            <ion-col size="12" v-else-if="respuesta == 'wait_to_transfer'">
               <ion-item lines="none">
                  <ion-text class="ion-text-center" :style="'width:100%'">
                     <p><ion-icon :icon="alarmSharp" color="primary" size="large"></ion-icon></p>
                     <h2>Transferencia reciente detectada</h2>
                     <p>Hemos detectado una transferencia parecida en un lapso de 30 segundos.</p>
                     <p>Espera 30 segundos y realiza de nuevo la transferencia.</p>
                  </ion-text>
               </ion-item>
               <ion-button @click="finishTransaction" expand="full" color="primary">
                  <ion-label>Intentar de nuevo</ion-label>
               </ion-button>
            </ion-col>
            <ion-col size="12" v-else-if="respuesta == 'same_brand'">
               <ion-item lines="none">
                  <ion-text class="ion-text-center" :style="'width:100%'">
                     <p><ion-icon :icon="lockClosedSharp" color="warning" size="large"></ion-icon></p>
                     <h2>Intento de transferencia a la misma marca</h2>
                     <p>No puedes transferir a tu marca.</p>
                     <p>Intenta enviando dinero a otra marca o local.</p>
                  </ion-text>
               </ion-item>
               <ion-button @click="finishTransaction" expand="full" color="primary">
                  <ion-label>Intentar de nuevo</ion-label>
               </ion-button>
            </ion-col>
            <ion-col size="12" v-else-if="respuesta == 'duplicated_transference'">
               <ion-item lines="none">
                  <ion-text class="ion-text-center" :style="'width:100%'">
                     <p><ion-icon :icon="lockClosedSharp" color="warning" size="large"></ion-icon></p>
                     <h2>Posible transferencia duplicada</h2>
                     <p>Hemos detectado una transferencia similar y se ha cancelado esta operacion automaticamente.</p>
                     <p>Verifica la seccion de transferencia para verificar por la misma.</p>
                  </ion-text>
               </ion-item>
               <ion-button @click="finishTransaction" expand="full" color="primary">
                  <ion-label>Intentar de nuevo</ion-label>
               </ion-button>
            </ion-col>
            <ion-col size="12" v-else>
               <ion-item lines="none">
                  <ion-text class="ion-text-center" :style="'width:100%'">
                     <p><ion-icon :icon="closeCircleSharp" color="danger" size="large"></ion-icon></p>
                     <h2>Error de sistema</h2>
                     <p>Ha habido un problema con la transaccion y no se ha realizado.</p>
                     <p>Por favor intenta mas tarde.</p>
                  </ion-text>
               </ion-item>
               <ion-button @click="finishTransaction" expand="full" color="primary">
                  <ion-label>Intentar de nuevo</ion-label>
               </ion-button>
            </ion-col>
         </ion-row>         
      </ion-grid>
   </div>
</template>