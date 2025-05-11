/**
 * // Convert a plaintext address into coordinates (latitude and longitude) using Nominatim
 *
 * @param address Address to geocode.
 * @returns An object containing the latitude and longitude of the address.
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number }> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'odontologia-app/1.0.0'
    }
  })

  const data = await response.json()

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Error')
  }

  const result = {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  }

  return result
}
