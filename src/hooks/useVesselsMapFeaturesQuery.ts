import { MapState } from '@rnmapbox/maps/lib/typescript/src/components/MapView'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_VESSELS_POSITIONS } from '../api/queryKeys.ts'
import { getVesselPositionsForBoundingRect } from '../api/getVesselPositionsForBoundingRect.ts'

export const useVesselsMapFeaturesQuery = (mapState: MapState | null) => {
    const boundingRect = useMemo(() => {
        if (!mapState) {
            return null
        }

        const [maxLon, maxLat] = mapState.properties.bounds.ne
        const [minLon, minLat] = mapState.properties.bounds.sw

        return {
            minLat,
            minLon,
            maxLat,
            maxLon,
        }
    }, [mapState])

    return useQuery({
        queryKey: [QUERY_VESSELS_POSITIONS, boundingRect],
        enabled: !!boundingRect && !!mapState && mapState?.properties.zoom >= 12,
        queryFn: () => (boundingRect ? getVesselPositionsForBoundingRect(boundingRect) : undefined),
        refetchInterval: 1000,
        staleTime: 0,
        placeholderData: previousData => previousData,
        select: data => (data?.vessels ? new Map(data.vessels.map(vessel => [vessel.mmsi, vessel])) : undefined),
    })
}
