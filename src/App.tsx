import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Map } from './components/Map.tsx'
import Mapbox from '@rnmapbox/maps'
import config from 'react-native-config'

Mapbox.setAccessToken(config.MAPBOX_API_TOKEN!)
const queryClient = new QueryClient()

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Map />
        </QueryClientProvider>
    )
}
