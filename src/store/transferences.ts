import { defineStore } from "pinia"
import { computed, ref } from "vue"

const useTransferenceStore = defineStore('transference', () => {

   const destinatary = ref<any>()
   const amountToRecieve = ref<string|number>()
   
   const getDiscount = computed( () => {
      const item = destinatary.value
      return (!item.discount) ? {} : item.discount
   })

   const getDestinatary = computed(() => destinatary.value)

   const shopName = computed(() => {

      const item = destinatary.value;

      console.log('destinatary >>> ', item);

      return (!item.group_name) ? item.name : item.group_name
   })

   return { destinatary, getDestinatary, getDiscount, shopName, amountToRecieve }

})

export default useTransferenceStore