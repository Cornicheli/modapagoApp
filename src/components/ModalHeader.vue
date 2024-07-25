<script setup lang="ts">
import { modalController } from '@ionic/vue';
import { close } from 'ionicons/icons'

const props = defineProps({
    title : String,
    color : String
})

const closeModal = () => modalController.dismiss()
</script>
<template>
    <ion-header>
        <ion-toolbar :color="props.color">
            <ion-icon :icon="close" style="font-size: 2.4rem; margin-left: 10px;" slot="start" @click="closeModal"/>
            <ion-title>{{ title }}</ion-title>
        </ion-toolbar>
    </ion-header>
</template>