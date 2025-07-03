import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, { measure, useAnimatedRef, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { formatCoordinates } from '../utils/formatCoordinates.ts'
import { GetVesselPositionsForBoundingRectResponse } from '../api/getVesselPositionsForBoundingRect.ts'

type Props = {
    isVisible: boolean
    onClose: () => void
    selectedVessel: GetVesselPositionsForBoundingRectResponse | undefined
}

export const DetailModal = ({ isVisible, onClose, selectedVessel }: Props) => {
    const animatedRef = useAnimatedRef()

    const style = useAnimatedStyle(() => {
        const commonStyle = {
            position: 'absolute',
            width: '100%',
        } as const

        if (_WORKLET) {
            const measurement = measure(animatedRef)

            if (!measurement) {
                return commonStyle
            }

            return {
                ...commonStyle,
                bottom: withTiming(isVisible ? 0 : -measurement.height, { duration: 300 }),
            }
        } else {
            return commonStyle
        }
    }, [isVisible])

    const { latitude, longitude } = formatCoordinates({
        latitude: selectedVessel?.latitude,
        longitude: selectedVessel?.longitude,
    })

    return (
        <Animated.View ref={animatedRef} style={style}>
            <View style={styles.centeredView}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>×</Text>
                </TouchableOpacity>
                <View style={styles.modalView}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.shipName}>
                        {selectedVessel?.shipName}
                    </Text>
                    <View style={styles.coordinatesContainer}>
                        <Text style={styles.coordinates}>{latitude}</Text>
                        <Text style={styles.coordinates}>{longitude}</Text>
                    </View>
                    <View>
                        <Text style={styles.label}>MMSI:</Text>
                        <Text style={styles.value}>{selectedVessel?.mmsi}</Text>
                        <Text style={styles.label}>COG:</Text>
                        <Text style={styles.value}>{selectedVessel?.cog}°</Text>
                        <Text style={styles.label}>SOG:</Text>
                        <Text style={styles.value}>{selectedVessel?.sog}kt</Text>
                        <Text style={styles.label}>Last seen:</Text>
                        <Text style={styles.value}>
                            {!!selectedVessel?.timestamp && new Date(selectedVessel.timestamp).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    shipName: {
        marginRight: 10,
        fontSize: 30,
        color: '#fff',
        marginBottom: 5,
        fontWeight: 600,
    },
    coordinatesContainer: {
        gap: 10,
        flexDirection: 'row',
        marginBottom: 20,
    },
    coordinates: {
        fontSize: 16,
        color: '#fff',
    },
    centeredView: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalView: {
        padding: 20,
        borderRadius: 20,
    },
    label: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 5,
    },
    value: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 10,
    },
    closeButton: {
        alignSelf: 'flex-end',
        top: 10,
        right: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 500,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
})
