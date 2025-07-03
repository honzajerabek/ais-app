import { apiClient } from './apiClient.ts'

export type BoundingRect = {
    minLon: number
    minLat: number
    maxLon: number
    maxLat: number
}

export type GetVesselPositionsForBoundingRectResponse = {
    mmsi: number
    cog: number
    sog: number
    timestamp: string
    shipName: string
    latitude: number
    longitude: number
}

export const getVesselPositionsForBoundingRect = async (params: BoundingRect) =>
    (
        await apiClient.get<{ vessels: GetVesselPositionsForBoundingRectResponse[] }>('/vessels-position', {
            params,
        })
    ).data
