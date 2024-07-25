import { defineStore } from "pinia";
import { getData, runAlert, runLoader, runToast } from '@/libs'
import { computed, ref } from "vue";
import moment from "moment";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { modalController } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";

const useRapipagoStore = defineStore('rapipago', () => {

    const router = useRouter()

    const route = useRoute()

    const authToken = ref<string|null|undefined>()
    
    const tokenCreatedAt = ref<any>()
    
    const http = computed( () => axios.create({ 
        baseURL : import.meta.env.VITE_APP_RAPIPAGO_URL,
        params : {
            token : localStorage.getItem('token')
        }
    }))

    const logAction = async (params : any) => {
        
        try {

            const response = await http.value.post('operation/log', {
                rapipago_token : authToken.value,
                params
            });

            const info = await response.data;

            console.log('Log success >>> ', info);
            
            
        } catch (error) {
            
            await runToast('Servicio no disponible.');
        }

    }

    const requestNewToken = async () => {
        
        const loader = await runLoader("Aguarde un momento...")

        try {
            
            const http = await axios.post(`${import.meta.env.VITE_APP_RAPIPAGO_URL}/acceso`)
            const response = await http.data;

            if(!response.access_token) 
                throw new Error("Rapipago no se encuentra disponible por el momento, intenta nuevamente mas tarde.") 
                
            authToken.value = response.access_token
            tokenCreatedAt.value = moment()


        } catch (error) {

            await ajaxError( error )

        } finally {

            loader.dismiss()
        }
    }

    const getToken = async () => {

        if(!authToken.value || typeof authToken.value === 'undefined' || authToken.value === undefined) 
            return await requestNewToken()
        
        if(!tokenCreatedAt.value)
            return await requestNewToken()

        // en el caso de que pase esas dos barreras, vamos a consultar la validez del token x su periodo de tiempo.

        const now = moment();
        const diff = now.diff( moment(tokenCreatedAt.value), 'minutes' )

        if(diff >= 10) 
            return await requestNewToken();
            
        return true;
        
    }

    const suggestContact = ( customMessage : string|undefined = undefined) => {

        if(!customMessage) {
            customMessage = `Ha ocurrido un error al procesar la operación, intente cerrando la app y volviendo entrar. 
                             Si el error persiste podés enviarnos mas información a nuestro correo: soporte@modapago.com`;
        } 

        return runAlert(customMessage);
    }

    const ajaxError  = async ( error : any ) => {

        if(isAxiosError(error)) {

            const data = error.response?.data;

            if(data.errors)
                return await showApiErrors(data.errors);
            else if(!data.message)
                return await suggestContact( )
            else 
                return await suggestContact( data.message )

        } else {
            
            return await runToast( String(error) )
        }
    }

    const showApiErrors = async (apiErrors: any) => {
        
        let messages = "";

        for (let i = 0; i < apiErrors.length; i++) {

            const error = apiErrors[i]

            if (error.code == "409_BILL_ALREADY_PAID") {
                error.code = null;
                error.message = "Esta factura ya se pagó, ¡Estas al día!"
            }

            messages += error.message + " \n ";
        }

        return await runAlert(messages)
    }

    const goToSearchForms = (item: any, closeModal: boolean = true) => {

        if(closeModal)
            modalController.dismiss()

        return router.replace({name: 'app.rapipago.invoice.search', params: { companyId: item.code, companyName: encodeURI(item.name)}})
    }

    const serviceName = computed( () => decodeURI(String(route.params.companyName)) )

    const serviceId = computed( () => route.params.companyId )


    const buscarFacturaxBarra = async (barcode: string) => {

            const loader = await runLoader("Buscando vencimientos para la barra: " + barcode);

            http.value.post(`company/barcode/${barcode}`, {
                rapipago_token : authToken.value
            })
            .then( (response: any): any => {

                let data = response.data;

                if (data.length == 0) {

                    const message = `No pudimos encontrar tu factura, puede que hayan pasado los plazos de pago. Intentá con la búsqueda manual. \n Barra: ${barcode}`;

                    runAlert(message);

                    return false;
                }

                if (data.errors) {
                    return showApiErrors(data.errors);
                }

                if (data.length > 1) {
                    localStorage.rapiBarrasEncontradas = JSON.stringify(data);
                    return router.push({ name: 'app.rapipago.barcode.collision' });
                }

                if (data.length == 1) {

                    localStorage.rapiVencimientos = JSON.stringify(data);

                    return router.push({
                        name: 'app.rapipago.invoices', params: {
                            companyId: data[0].companyCode,
                            companyName: encodeURI(data[0].companyName)
                        }
                    });

                }


            }).catch( errors => {                                                                                                 

                suggestContact()
            })
            .finally( () => {

                loader.dismiss();
            });                
    }

    return {
        http,
        authToken,
        tokenCreatedAt,
        suggestContact,
        showApiErrors,
        getToken,
        goToSearchForms,
        serviceName,
        serviceId,
        buscarFacturaxBarra,
        logAction,
        ajaxError 
    }
})

export default useRapipagoStore