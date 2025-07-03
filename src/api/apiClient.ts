import axios from 'axios'
import config from 'react-native-config'

export const apiClient = axios.create({
    baseURL: config.BE_ENDPOINT,
})
