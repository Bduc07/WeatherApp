import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const API_BASE_URL = 'http://10.0.2.2:8000/api'

type WeatherData = {
  location: string
  condition: string
  temperature: number
  humidity: number
  wind: number
  pressure: number
  feelsLike: number
}

const Dashboard = () => {
  const [searchText, setSearchText] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchWeather = async (city = 'Kathmandu') => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/weather/?city=${encodeURIComponent(city)}`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not load weather.')
      }

      setWeather(data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not load weather.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [])

  const handleSearch = () => {
    const city = searchText.trim()

    if (!city) {
      setErrorMessage('Please enter a city name.')
      return
    }

    fetchWeather(city)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef6f8" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Weather App</Text>
            <Text style={styles.title}>Today's Forecast</Text>
          </View>
          <Text style={styles.location}>
            {weather ? weather.location.split(',')[0] : 'Kathmandu'}
          </Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search city"
            placeholderTextColor="#78909c"
            returnKeyType="search"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isLoading}
            style={[styles.searchButton, isLoading && styles.disabledButton]}
            onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.weatherCard}>
          {isLoading && !weather ? (
            <ActivityIndicator color="#ffffff" size="large" />
          ) : weather ? (
            <>
              <View>
                <Text style={styles.city}>{weather.location}</Text>
                <Text style={styles.condition}>{weather.condition}</Text>
              </View>
              <Text style={styles.temperature}>{weather.temperature} C</Text>
            </>
          ) : (
            <Text style={styles.condition}>
              {errorMessage || 'Weather is not available.'}
            </Text>
          )}
        </View>

        {weather ? (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Humidity</Text>
              <Text style={styles.statValue}>{weather.humidity}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Wind</Text>
              <Text style={styles.statValue}>{weather.wind} km/h</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pressure</Text>
              <Text style={styles.statValue}>{weather.pressure} hPa</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Feels Like</Text>
              <Text style={styles.statValue}>{weather.feelsLike} C</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef6f8',
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  kicker: {
    color: '#4f6f78',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#15262d',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  location: {
    color: '#15262d',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 5,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#15262d',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#0d7c86',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  disabledButton: {
    opacity: 0.65,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#b00020',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  weatherCard: {
    backgroundColor: '#0f3f4a',
    borderRadius: 8,
    padding: 22,
    minHeight: 190,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  city: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  condition: {
    color: '#c8edf2',
    fontSize: 16,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  temperature: {
    color: '#ffffff',
    fontSize: 62,
    fontWeight: '900',
    lineHeight: 70,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    minHeight: 92,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-between',
  },
  statLabel: {
    color: '#607d86',
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: '#15262d',
    fontSize: 22,
    fontWeight: '800',
  },
})
