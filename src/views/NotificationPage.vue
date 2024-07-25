<template>
    <ion-page>
        <ion-header translucent>
            <ion-toolbar>
                <ion-title>Notificaciones</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="ClosePopover" color="dark">
                        <ion-icon :icon="arrowBackSharp"></ion-icon> Volver
                    </ion-button>
                </ion-buttons>
                <ion-buttons slot="end" v-if="count > 0">
                    <ion-button @click="CleanAll" color="dark">
                        <ion-icon :icon="trashSharp"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen>
            <ion-list>
                <ion-item-sliding v-for="(notification, index) in notifications" :key="index">
                    <ion-item button @click='checkPayload(notification.data.title)'>
                        <ion-text style='width:100%'>
                            <h6 v-text='notification.data.title'></h6>
                            <p v-text='notification.data.body'></p>
                        </ion-text>
                    </ion-item>
                    <ion-item-options side="start">
                        <ion-item-option color="danger" slot="icon-only" @click="DeleteNotification(index)">
                            <ion-icon :icon="closeSharp"></ion-icon>
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
                <ion-item v-if="notifications.lenght == 0" class='ion-text-center'>
                    <ion-label>

                        <p><ion-icon :icon="notificationsOffSharp" size='large'></ion-icon></p>

                        <p>No tienes notificaciones.</p>

                    </ion-label>
                </ion-item>
            </ion-list>
            <ion-button @click="ClosePopover" expand="full">
                Cerrar
            </ion-button>
        </ion-content>
    </ion-page>
</template>
<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItemSliding, IonItem, IonText, IonItemOptions, IonItemOption, IonLabel } from '@ionic/vue';
import { modalController } from '@ionic/vue';
import { arrowBack, arrowBackSharp, closeSharp, notificationsOffSharp, trashSharp } from 'ionicons/icons';
import { ref } from 'vue';


const count = ref<any>(0)
const notifications = ref<any>([])

const ClosePopover = () => modalController.dismiss()

const CleanAll = () => {
    localStorage.Notifications = "[]"
    notifications.value = []
}

const DeleteNotification = (id: number ) => {
    if (localStorage.Notifications !== '[]') {

        let notificaciones = JSON.parse(localStorage.Notifications);

        let NotificationArray = Object.keys(notificaciones).map(i => notificaciones[i]);

        NotificationArray.splice(id, 1);

        notifications.value = NotificationArray;

        localStorage.Notifications = JSON.stringify(NotificationArray);

        count.value = notifications.value.lenght;
    }

}

const checkPayload = (texto: string) => {

    if (localStorage.Notifications !== '[]') {

        var notificaciones = JSON.parse(localStorage.Notifications);
        var NotificationArray = Object.keys(notificaciones).map(i => notificaciones[i]);
        var found: any = NotificationArray.findIndex(notificaciones => notificaciones.data.title === texto);

        if (found !== -1) {

            var type = found.data.type;
            localStorage.redirect = type;

            DeleteNotification(found);
            ClosePopover();
        }
    }
}

</script>
    
    