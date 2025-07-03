import { Camera, Images, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import { StyleSheet, View } from 'react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapState } from '@rnmapbox/maps/lib/typescript/src/components/MapView'
import { GeolocationStatus, useGeoLocation } from '../hooks/useGeoLocation.ts'
import { useVesselsMapFeaturesQuery } from '../hooks/useVesselsMapFeaturesQuery.ts'
import { DetailModal } from './DetailModal.tsx'
import { OnPressEvent } from '@rnmapbox/maps/src/types/OnPressEvent.ts'

export const Map = () => {
    const geoLocation = useGeoLocation()

    const [mapState, setMapState] = useState<MapState | null>(null)

    const hasEnoughZoom = mapState && mapState.properties.zoom >= 12

    const { data } = useVesselsMapFeaturesQuery(mapState)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedMMSI, setSelectedMMSI] = useState<number | null>(null)

    const selectedVessel = useMemo(
        () => (selectedMMSI && data ? data.get(selectedMMSI) : undefined),
        [selectedMMSI, data]
    )

    const vessels = useMemo(() => {
        const values = data?.values ? Array.from(data.values()) : []

        return values.map(vessel => ({
            type: 'Feature' as const,
            id: vessel.mmsi,
            properties: {
                icon: selectedMMSI && selectedMMSI === vessel.mmsi ? 'vesselActive' : 'vessel',
                rotation: vessel.cog,
                shipName: vessel.shipName,
                sog: vessel.sog > 0 ? `${vessel.sog}kt` : '',
                cog: vessel.cog > 0 ? `${vessel.cog}°` : '',
                mmsi: vessel.mmsi,
                timestamp: vessel.timestamp,
                latitude: vessel.latitude,
                longitude: vessel.longitude,
            },
            geometry: { type: 'Point' as const, coordinates: [vessel.longitude, vessel.latitude] },
        }))
    }, [data])

    const features = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: hasEnoughZoom && vessels?.length ? vessels : [],
        }),
        [data, hasEnoughZoom]
    )

    const handleCloseModal = () => {
        setIsModalVisible(false)
        setSelectedMMSI(null)
    }

    const handleOpenModal = useCallback((mmsi: number) => {
        setIsModalVisible(true)
        setSelectedMMSI(mmsi)
    }, [])

    const handleSetMapState = useCallback((state: MapState) => {
        setMapState(state)
    }, [])

    const handlePressVesselIcon = useCallback(
        (e: OnPressEvent) => {
            const feature = e.features[0]
            if (feature && feature.properties) {
                const { mmsi } = feature.properties
                handleOpenModal(mmsi)
            }
        },
        [handleOpenModal]
    )

    useEffect(() => {
        if (selectedMMSI && !selectedVessel) {
            handleCloseModal()
        }
    }, [selectedMMSI, data])

    const [_isMapReady, setIsMapReady] = useState(false)

    return (
        <View style={styles.page}>
            {(geoLocation.status === GeolocationStatus.READY ||
                geoLocation.status === GeolocationStatus.NOT_AVAILABLE) && (
                <MapView
                    logoEnabled={false}
                    scaleBarPosition={{ bottom: 8, right: 8 }}
                    compassEnabled
                    attributionEnabled={false}
                    scaleBarEnabled={false}
                    style={styles.map}
                    onMapIdle={handleSetMapState}
                    // workaround for https://github.com/rnmapbox/maps/issues/3836
                    onDidFinishLoadingMap={() => setIsMapReady(true)}
                >
                    <Camera
                        defaultSettings={{
                            centerCoordinate:
                                geoLocation.status === GeolocationStatus.READY
                                    ? [geoLocation.data.coords.longitude, geoLocation.data.coords.latitude]
                                    : [4.8357, 52.3779], // Default to Amsterdam if location not available
                            zoomLevel: 8,
                        }}
                    />
                    <Images
                        images={{
                            vessel: require('../assets/vessel.png'),
                            vesselActive: require('../assets/vessel-active.png'),
                        }}
                    />
                    <ShapeSource id="iconSource" shape={features} onPress={handlePressVesselIcon}>
                        <SymbolLayer
                            id="iconSymbols"
                            style={{
                                iconImage: ['get', 'icon'],
                                iconAllowOverlap: true,
                                iconRotate: ['get', 'rotation'],
                                iconRotationAlignment: 'map',
                                iconSize: ['interpolate', ['linear'], ['zoom'], 5, 0.1, 10, 0.2, 15, 0.3],
                            }}
                        />
                        <SymbolLayer
                            id="shipName"
                            style={{
                                textField: ['get', 'shipName'],
                                textSize: 12,
                                textAnchor: 'top',
                                textOffset: [0, 1.2],
                                textAllowOverlap: false,
                                textColor: '#333',
                            }}
                        />
                        <SymbolLayer
                            id="sog"
                            style={{
                                textField: ['get', 'sog'],
                                textSize: 12,
                                textAnchor: 'bottom',
                                textOffset: [0, -1.2],
                                textAllowOverlap: false,
                                textColor: '#333',
                            }}
                        />
                    </ShapeSource>
                </MapView>
            )}
            <DetailModal isVisible={isModalVisible} onClose={handleCloseModal} selectedVessel={selectedVessel} />
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        flex: 1,
    },
})
