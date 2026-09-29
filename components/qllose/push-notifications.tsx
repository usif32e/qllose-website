'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import {
  PushNotifications,
  type Token,
  type PushNotificationSchema,
  type ActionPerformed,
} from '@capacitor/push-notifications'

export function PushNotificationSetup() {
  useEffect(() => {
    const setupPushNotifications = async () => {
      const platform = Capacitor.getPlatform()

      // Only run on native Android/iOS.
      if (platform !== 'android' && platform !== 'ios') {
        return
      }

      try {
        await PushNotifications.addListener(
          'registration',
          (token: Token) => {
            console.log('Qllose Push Token:', token.value)
          },
        )

        await PushNotifications.addListener(
          'registrationError',
          (error) => {
            console.error(
              'Qllose Push Registration Error:',
              error,
            )
          },
        )

        await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log(
              'Qllose Push Notification:',
              notification,
            )
          },
        )

        await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action: ActionPerformed) => {
            console.log(
              'Qllose Push Notification Action:',
              action,
            )
          },
        )

        let permission =
          await PushNotifications.checkPermissions()

        if (permission.receive === 'prompt') {
          permission =
            await PushNotifications.requestPermissions()
        }

        if (permission.receive !== 'granted') {
          console.log(
            'Push notification permission not granted.',
          )
          return
        }

        await PushNotifications.register()
      } catch (error) {
        console.error(
          'Qllose Push Setup Error:',
          error,
        )
      }
    }

    void setupPushNotifications()

    return () => {
      void PushNotifications.removeAllListeners()
    }
  }, [])

  return null
}