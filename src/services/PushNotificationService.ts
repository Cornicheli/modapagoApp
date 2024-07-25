
import { PushNotifications } from '@capacitor/push-notifications'
import { isPlatform } from '@ionic/vue';

export default class PushNotificationService {

   public async addListeners() {

      await PushNotifications.addListener('registration', async (token) => {
         localStorage.FCM_TOKEN = token.value
         console.log('nuevo token >>> ', token.value);
         
      });

      await PushNotifications.addListener('registrationError', err => {
         console.error('Registration error: ', err.error);
      });

      await PushNotifications.addListener('pushNotificationReceived', notification => {
         console.log('Push notification received: ', notification);
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
         console.log('Push notification action performed', notification.actionId, notification.inputValue);
      });
   }

   public async registerDevice() {

      if(!localStorage.FCM_TOKEN)
      {
         let permStatus = await PushNotifications.checkPermissions();

         if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
         }
      
         if (permStatus.receive !== 'granted') {
            throw new Error('User denied permissions!');
         }
      
         await PushNotifications.register();
      }
   }

   public async initWorker() {
      
      if(isPlatform('capacitor')) {         
         await this.addListeners()
         await this.registerDevice()
      }
   }

}