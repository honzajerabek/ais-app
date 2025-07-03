type Params = {
    latitude: number | undefined
    longitude: number | undefined
}

export const formatCoordinates = ({ latitude, longitude }: Params) => {
    if (latitude === undefined || longitude === undefined) {
        return {}
    }

    const latDirection = latitude >= 0 ? 'N' : 'S'
    const lonDirection = longitude >= 0 ? 'E' : 'W'

    const formattedLatitude = `${Math.abs(latitude).toFixed(6)}°${latDirection}`
    const formattedLongitude = `${Math.abs(longitude).toFixed(6)}°${lonDirection}`

    return {
        latitude: formattedLatitude,
        longitude: formattedLongitude,
    }
}
