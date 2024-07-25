<template>
    <ion-page>
        <BasePage>
            <ion-content  class="secondary" fullscreen>
                <ion-item lines="none">
                    <ion-grid class="bg-white rapi-section">
                        <ion-row>
                            <ion-col size="12">
                                <ion-title class="ion-text-center" style="padding-top: 0.4em">{{ empresa }}</ion-title>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-item>
                <ion-grid>
                    <ion-row>
                        <ion-col size="11" offset="0.5">
                            <ion-button class="rapi-header-btn" style="height: auto;">{{ form.name }}</ion-button>
                            <div v-for=" (item, index) in form.form" :key="index">                 
                                <ion-item class="rapi-input">
                                    <ion-label v-if="form.component == 'LABEL'">{{ item.label }}</ion-label>
                                    <ion-input                                     
                                                :placeholder="item.label"
                                                v-else-if=" ( item.dataType == 'ALF' || item.dataType == 'IMP' || item.dataType == 'CBA' ) " 
                                                @input="form.form[index]['value'] = $event.target.value"
                                    />
                                </ion-item>
                            </div>
                            <ion-button color="success" @click="iniciarRecarga()">Preparar recarga</ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-content>
        </BasePage>
    </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useRapipagoStore from '@/store/rapipago'
import { useRouter } from 'vue-router';
import { runLoader } from '@/libs';
import BasePage from '@/components/BasePage.vue';

const store = useRapipagoStore()

const router = useRouter()

const empresa = computed(() => {
    return store.serviceName;
})

const empresaId = computed(() => {
    return store.serviceId;
})

const form = computed(() => {
    return JSON.parse(String(localStorage.getItem('form_recarga')));
})

const iniciarRecarga = async () => {
    
    await store.getToken()

    const loader = await runLoader('Preparando recarga, espere.')

    try {                

        
        const baseForm = form.value;
        const forms = baseForm.form;
        const paymentForm: any = {};

        for (const i in forms) {
            if (Object.hasOwnProperty.call(forms, i)) {
                const form = forms[i];
                paymentForm[form.field] = form.value;
            }   
        }

        const finalPaymentForm = {
            paymentMethod : "PES",
            companyCode : empresaId.value,
            companyName : empresa.value,
            paymentModeId : baseForm.paymentModeId,
            form : paymentForm
        };
        
        await store.logAction(finalPaymentForm);

        const http = await store.http.post('confirm-prepaid-operation', {
            rapipago_token : store.authToken,
            'params' : finalPaymentForm
        })

        const infoApi = await http.data;

        if (infoApi.errors) {                    

            throw new Error(infoApi.errors);                                        

        } else {

            localStorage.rapiTicket = JSON.stringify(infoApi.response.ticket);                            

            return router.replace({ name : 'app.rapipago.ticket' , params: {
                transferenceId : infoApi.transference.id
            }});    
        }
        
    } catch (error) {
        
       store.ajaxError(error)

    } finally {

        loader.dismiss()
    }
    
}
</script>

<style>
    .rapi-header-btn {
        white-space: normal;
        margin-top: 1em;
        --padding-top: 0.5em;
        --padding-bottom: 0.5em;
    }
    .rapi-input {
        margin-top : 0.5em;
        margin-bottom : 0.5em;
        --border-radius: 0.8em;
    }
    .rapi-input ion-input, .rapi-input ion-datetime {
        --border-radius: 0.8em;
    }
    .rapi-input ion-datetime, .rapi-input ion-select {
        --padding-start : 0;
    }
</style>
<style scoped>
    ion-button   {
        border: none !important;
        -webkit-box-shadow: none;
        box-shadow: none;
        --background: #b1b1b1;
        --background-hover : #b1b1b1;
        --color: rgb(68, 68, 68);
        --box-shadow: none;
    }
</style>