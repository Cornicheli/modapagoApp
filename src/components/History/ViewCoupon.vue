<template>
   <div>
       <ModalHeader title="Detalle de la transaccion" />
       <ion-content fullscreen>
           <pre hidden>
            {{ transacciones }}
           </pre>
           <ion-item lines="full" style="padding-bottom:10px;">
               <ion-label class="ion-text-center" color="modatex" v-if="ventainfo.coupon_type == 'modatex'"><strong style="font-size:1.1em;"> Pago de pedido en Modatex</strong></ion-label>
               <ion-label class="ion-text-center" color="black" v-else-if="ventainfo.coupon_type == 'direct'"><strong style="font-size:1.1em;"> Pago de venta directa</strong></ion-label>
           </ion-item>
           <ion-item lines="none" v-if="ventainfo.coupon_type == 'modatex'">
               <ion-text class="ion-text-center" style="width:100%;"> 
                   <p style="font-size:1.3em;"> Id de pedido <strong v-text="'#' + ventainfo.id"></strong></p> 
                   <p style="font-size:2.5em" class="ion-no-margin"> <span v-text="ventainfo.valor_cupon"></span></p>
               </ion-text>
           </ion-item>
           <ion-item lines="none" v-else-if="ventainfo.coupon_type == 'direct'">
               <ion-text class="ion-text-center" style="width:100%;"> 
                   <p style="font-size:1.3em"> Id de venta directa <strong v-text="'#' + ventainfo.id"></strong></p> 
                   <p style="font-size:2.5em" class="ion-no-margin"> <span v-text="ventainfo.valor_cupon"></span></p>
               </ion-text>
           </ion-item>
           <ion-grid>
               <ion-row v-for="transaccion in transacciones" :key="transaccion.id" class="ion-padding ion-margin-vertical" style="background-color:#e3e3e3;">
                   <ion-col size="12">
                       <ion-label text-wrap>
                           <p>Referencia de pago: <span v-text="transaccion.reference"></span></p>                    
                           <p>Numero de orden: <span v-text="transaccion.payu_order_id"></span></p>
                           <p>Fecha de operacion: <span v-text="parseDate(transaccion.created_at)"></span></p>
                           <p v-if="transaccion.payu_response_date != null">Fecha de pago: <span v-text="parseDate(transaccion.payu_response_date)"></span></p>
                       </ion-label>
                   </ion-col>
                   <ion-col size="12">
                       <ion-item color="success"  class="transaction-status" v-if="transaccion.payment_status == 'APPROVED'">
                           <ion-label class="ion-text-center" ><span>Acreditado</span></ion-label>
                       </ion-item>
                       <ion-item color="warning"  class="transaction-status"  v-else-if="transaccion.payment_status == 'PENDING'">
                           <ion-label class="ion-text-center" ><span>Pendiente</span></ion-label>
                       </ion-item>
                       <ion-item color="danger"  class="transaction-status"  v-else-if="transaccion.payment_status == 'DECLINED'">
                           <ion-label class="ion-text-center" ><span>Declinada</span></ion-label>
                       </ion-item>
                       <ion-item color="dark"  class="transaction-status"  v-else-if="transaccion.payment_status == 'EXPIRED'">
                           <ion-label class="ion-text-center" ><span>Expirada</span></ion-label>
                       </ion-item>
                       <ion-item color="danger" class="transaction-status"   v-else-if="transaccion.payment_status == 'ERROR'">
                           <ion-label class="ion-text-center" ><span>Error</span></ion-label>
                       </ion-item>
                       <ion-item color="danger" class="transaction-status"   v-else-if="transaccion.payment_status == 'REJECTED'">
                           <ion-label class="ion-text-center" ><span>Rechazado</span></ion-label>
                       </ion-item>
                       <ion-item color="danger" class="transaction-status"   v-else-if="transaccion.payment_status == 'AVAILABLE'">
                           <ion-label class="ion-text-center" ><span>Disponible</span></ion-label>
                       </ion-item>
                       <ion-item color="medium"  class="transaction-status"  v-else-if="transaccion.payment_status == 'REFUNDED'">
                           <ion-label class="ion-text-center" ><span>Reembolsado</span></ion-label>
                       </ion-item>
                   </ion-col>
               </ion-row>
           </ion-grid>
       </ion-content>
   </div>
   </template>
   
<script setup lang="ts">
import { parseDate, notFoundShopImage } from '@/libs';
import { modalController } from '@ionic/vue';
import { arrowBackSharp } from 'ionicons/icons';
import { onBeforeMount, ref } from 'vue';
import ModalHeader from '../ModalHeader.vue';

const props = defineProps<{ transacciones: any, ventainfo: any }>()

const closeModal = () => modalController.dismiss()

const image_url = (value: any) => {

   var img_url = '/img/'+String(value)+'.png';

   return img_url.toLowerCase();
}

</script>

<style scoped>
.transaction-status{
    --min-height:auto !important;
}
</style>

