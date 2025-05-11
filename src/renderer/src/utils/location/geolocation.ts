/**
 * Get the current location of the user using the Geolocation API.
 *
 * @returns {Promise<GeolocationPosition>} A promise that resolves to the user's current location.
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('La geolocalización no está disponible en este navegador.'))
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000
    })
  })
}
