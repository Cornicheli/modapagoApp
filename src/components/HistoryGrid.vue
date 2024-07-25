<script setup lang="ts">
import { modalController, IonList, IonListHeader, IonNote, IonAvatar } from '@ionic/vue';
import moment from 'moment';
import ViewTransference from '@/components/History/ViewTransference.vue'
import ViewCoupon from '@/components/History/ViewCoupon.vue'
import ViewRequest from '@/components/History/ViewRequest.vue'
import ViewService from '@/components/History/ViewService.vue'
import { removeCircleSharp } from 'ionicons/icons';
import { ref } from 'vue';


const emits = defineEmits(['movimientos']);

const props = defineProps<{
   movimientos : any,
   fetch : boolean,
   contar : string|number,
   start : number|string,
   brand : any
}>()

const getTransactionStatusClass = (status: string|undefined) => {
   
   let style = 'medium';

   switch (status) {
        case 'APROBADA':
            style = 'success';
          break;
        case 'PAGO_FINALIZADO':
            style = 'success';
          break;
        case 'PENDIENTE':
            style = 'warning';
          break;
        case 'PAGO_PENDIENTE':
            style = 'warning';
          break;
        case 'DECLINADA':
            style = 'danger';
          break;
        default:
            style = 'medium';
          break;
   }

   return style
}

const formatDate = (value: string, format:string) => {

   if(!value)
      return "Sin fecha";

   value = value.toString();

   if(moment(value).isValid())
      return moment(value,'YYYY-MM-DDTHH:mmZ').format(format);
   
   return value;
}


const openModal = (array: any, array2: any ) => {

   //return;
   const componente = ref<any>({});
   const data = ref<any>({});

   if(typeof (array.pagopymes_id) !== 'undefined'){

      data.value =  {
         service : array
      };

      componente.value = ViewService;

   }else if(typeof (array.accounts) !== 'undefined'){

      data.value =  {
         request : array
      };

      componente.value = ViewRequest;

   } else if(typeof (array.transacciones) === 'undefined'){

      array = array2;

      data.value =  {
         transacciones : array
      };

      componente.value = ViewTransference;

   } else {

      data.value =  {
         transacciones : array.transacciones,
         ventainfo : array
      };


      componente.value = ViewCoupon;
   }

   modalController.create({
          component: componente.value,
          componentProps: data.value,
   })
   .then( element => {
      element.present()
      element.onWillDismiss().then( d => Recharge(d))
   })
}

const Recharge = (d: any) => {
  if(localStorage.recharge){
      emits('movimientos');
      localStorage.removeItem('recharge');
  }
}

const badgeColor = (movimiento: any) => {
  if (!movimiento.payment_status)
    return 'success';
  
  if(movimiento.payment_status == 'APROBADA')
    return 'success';
  else 
    return 'medium';
}
</script>
<template>
  <ion-col size="12">
    <ion-list v-if="props.fetch == false || Number(props.start) > 0">
      <ion-item @click="openModal(movimiento,{'pagofacil_operation_id' : movimiento.pagofacil_operation_id, 'pagofacil_ticket' : movimiento.pagofacil_ticket,  'to' : movimiento.transf_to, 'from' : movimiento.transf_from,'amount' : movimiento.amount, 'date' : movimiento.created_at, 'description': movimiento.description, 'id': movimiento.id, 'discount_amount' : movimiento.discount_amount, 'comprobante_rapipago' : movimiento.comprobante_rapipago, 'rapipago_operation_id' : movimiento.rapipago_operation_id })" 
            v-for="movimiento in props.movimientos" 
            :key="movimiento.hash" 
            lines="full" 
            detail>
        <pre hidden>{{ movimiento }}</pre>
        <ion-avatar  slot="start" style="display:block; width: 56px;height: 56px;margin:0;">
          <img v-if="movimiento.coupon_type == 'modatex'" src="/img/icon-moda-app.png"/>
          <img v-else-if="movimiento.rapipago_operation_id != null" src="/img/rapipago/logos/logo-rapipagos.png">
          <img v-else-if="movimiento.pagofacil_operation_id != null" src="/img/pagofacil.png">
          <img v-else-if="movimiento.accounts" src="/img/icon-retiro-app.png"/>
          <img v-else-if="movimiento.transacciones == null && !movimiento.pagopymes_id && !movimiento.comprobante_rapipago" src="/img/icon-tranfer-app.png" />
          <img v-else-if="movimiento.coupon_type == 'direct'" src="/img/icon-cupon-app.png"/>
          <img v-else-if="movimiento.transacciones == null && movimiento.pagopymes_id  && !movimiento.comprobante_rapipago" src="/img/icon-pago-app.png" />
        </ion-avatar>

        <ion-label text-wrap>
          <ion-text v-if="movimiento.coupon_type == 'modatex'">
            <h5 style="font-weight:600; margin: 0; text-align:center;">Venta Modatex</h5>
            <h5 style="text-align:center;"><span  v-text="'MT #' + movimiento.id"></span></h5>
          </ion-text>
          <ion-text v-else-if=" movimiento.coupon_type == 'direct' ">
            <h5 style="font-weight:600; margin: 0; text-align:center;">Cupon directo</h5>
            <h6 style="text-align:center;"><span  v-text="'CD #' + movimiento.id" ></span></h6>
          </ion-text>
          <ion-text v-else-if="movimiento.accounts && !movimiento.req_refunded && !movimiento.comprobante_rapipago && !movimiento.pagofacil_operation_id">
            <h5 style="font-weight:600; margin: 0; text-align:center;">Retiro / Pago a terceros</h5>
            <h5 style="text-align:center;"> <span v-text="'RT #' + movimiento.id"></span></h5>
          </ion-text>
          <ion-text v-else-if="movimiento.accounts && movimiento.req_refunded && !movimiento.comprobante_rapipago && !movimiento.pagofacil_operation_id">
            <h5 style="font-weight:600; margin: 0; text-align:center;">Retiro / Pago a terceros (Devolución)</h5>
            <h5 style="text-align:center;"> <span v-text="'RT #' + movimiento.id"></span></h5>
          </ion-text>
          <ion-text v-else-if="movimiento.transacciones == null && !movimiento.pagopymes_id  && !movimiento.comprobante_rapipago && !movimiento.pagofacil_operation_id">
            <h5 style="font-weight:600; margin: 0; text-align:center;">Transferencias</h5>
            <h6 style="text-align:center;"> <span v-text="'MP #' + movimiento.id"></span></h6>
          </ion-text>
          <ion-text v-else-if="movimiento.transacciones == null && movimiento.pagopymes_id  && !movimiento.comprobante_rapipago && !movimiento.pagofacil_operation_id">
            <h5 style="font-weight:600; margin: 0; text-align:center;">Pago Impuestos</h5>
            <h6 style="text-align:center;"><span v-text="'PF #' + movimiento.id"></span></h6>
          </ion-text>
          <ion-text v-else-if="movimiento.comprobante_rapipago != null || movimiento.pagofacil_operation_id != null" class="ion-text-center">
            <h5 style="font-weight:600; margin: 0; text-align:center;">Pago de servicios</h5>
            <h6 style="text-align:center;"><span v-text="'PR #' + movimiento.id"></span></h6>
          </ion-text>
        </ion-label>
        <ion-note slot="end" :style="'padding: 23px 0px; margin: 0 7px;text-align: right;'">
          <ion-text color="danger" v-if="(movimiento.pagofacil_operation_id || movimiento.accounts || movimiento.pagopymes_id || (movimiento.transacciones == null && movimiento.is_positive == false)) && !movimiento.req_refunded">
            <h4 style="margin-top: 0;" v-if="movimiento.discount_amount">-$ {{movimiento.discount_amount}}</h4>
            <h4 style="margin-top: 0;" v-else>$ - {{movimiento.amount}}</h4>
            <div v-if="movimiento.pagofacil_ticket && movimiento.pagofacil_ticket.status == 'PAGO_PENDIENTE'" style="margin: 5px 0;">
              <ion-badge :color="getTransactionStatusClass(movimiento.pagofacil_ticket.status)">Procesando</ion-badge>
            </div>
          </ion-text>
          <ion-text color="success" v-else-if="(movimiento.accounts && movimiento.req_refunded)">
            <h4 style="margin-top: 0;" v-if="movimiento.discount_amount">$ {{movimiento.discount_amount}}</h4>
            <h4 style="margin-top: 0;" v-else>$ {{movimiento.amount}}</h4>
            
          </ion-text>
          <ion-text :color="badgeColor(movimiento)" v-else-if="movimiento.coupon_type == 'direct' || movimiento.coupon_type == 'modatex' || (movimiento.transf_from)">
            <h4 style="margin-top: 0;">{{movimiento.amount}}</h4>
            <p v-if="movimiento.payment_status">
              <ion-badge :color="getTransactionStatusClass(movimiento.payment_status)">{{  movimiento.payment_status  }}</ion-badge>
            </p>
          </ion-text>
          <ion-text v-else>
            <h4 style="margin-top: 0;">$ {{movimiento.amount}}</h4>
          </ion-text>
          <p style="margin:0;">{{formatDate(movimiento.created_at,"DD/MM/YYYY HH:mm ")}}</p>
        </ion-note>
      </ion-item>
      <div v-if="contar == 0">
        <ion-item   lines="full" class="ion-no-margin">
          <ion-label class="ion-text-center" text-wrap>
            <p><ion-icon :icon="removeCircleSharp" size="large"></ion-icon></p>
            <p>No se ha encontrado actividad con los opciones dadas, intente de nuevo.</p>
          </ion-label>
        </ion-item>
      </div>
    </ion-list>
    <ion-list v-else>
      <ion-list-header>
        <h4><skeleton animated :style="`width: 250px;`"></skeleton></h4>
      </ion-list-header>
      <ion-item v-for="i in 10" :key="i" lines="full" class="ion-no-margin">
        <ion-label text-wrap>
          <h6><skeleton animated :style="`width: 100px;`"></skeleton></h6>
          <h6><skeleton animated :style="`width: 50px;`"></skeleton></h6>
          <h6><skeleton animated :style="`width: 150px;`"></skeleton></h6>
        </ion-label>
        <ion-note slot="end" class="ion-padding">
          <h6><skeleton animated :style="`width: 100px;`"></skeleton></h6>
        </ion-note>
      </ion-item>
    </ion-list>
    <div v-if="Number(start) > 0 && fetch == true">
      <ion-item v-for="i in 3" :key="i" lines="full">
        <ion-label>
          <p><skeleton animated :style="`width: 100px;`"></skeleton></p>
          <p><skeleton animated :style="`width: 60px;`"></skeleton></p>
          <p><skeleton animated :style="`width: 150px;`"></skeleton></p>
        </ion-label>
        <ion-note slot="end" class="ion-padding">
          <h6><skeleton animated :style="`width: 100px;`"></skeleton></h6>
        </ion-note>
      </ion-item>
    </div>
  </ion-col>
</template>