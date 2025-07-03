import { useEffect, useState } from 'react'
import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation'
import { check, request } from 'react-native-permissions'
import { PERMISSIONS } from 'react-native-permissions/src/permissions.ios.ts'

export enum GeolocationStatus {
    INITIALIZING = 'initializing',
    NOT_AVAILABLE = 'not-available',
    READY = 'ready',
}


type BaseGeolocationResult =
    | {
    status: GeolocationStatus.INITIALIZING
}
    | {
    status: GeolocationStatus.NOT_AVAILABLE
}
    | {
    status: GeolocationStatus.READY
    data: GeolocationResponse
}

export const useGeoLocation = () => {
    const [location, setLocation] = useState<BaseGeolocationResult>({ status: GeolocationStatus.INITIALIZING })

    useEffect(() => {
        const getLocation = async () => {

            const permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)

            try {
                if (permissionStatus !== 'granted') {
                    setLocation({ status: GeolocationStatus.NOT_AVAILABLE })
                    return
                }

                Geolocation.getCurrentPosition((position) => setLocation({
                    status: GeolocationStatus.READY,
                    data: position,
                }), () => setLocation({ status: GeolocationStatus.NOT_AVAILABLE }), {
                    enableHighAccuracy: true,
                })

            } catch (error) {
                console.error('Error getting location:', error)
            }
        }

        getLocation()
    }, [])

    return location
}
