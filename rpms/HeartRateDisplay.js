import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import database from './firebaseConfig';
import MapComponent from './MapComponent';
import HeartRateChart from './HeartRateChart';
import axios from 'axios';

const GOOGLE_API_KEY = '"***********************",';
const screenWidth = Dimensions.get('window').width;

const HeartRateDisplay = () => {
  const [heartRateData, setHeartRateData] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [alert, setAlert] = useState(false);
  const [threshold, setThreshold] = useState(150); // Default alert threshold
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const fetchLocationFromIP = async (ip) => {
    try {
      setLoadingLocation(true);

      const response = await axios.post(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`,
        {
          considerIp: true,
        }
      );

      const { location } = response.data;
      if (location && location.lat && location.lng) {
        setLocation({ latitude: location.lat, longitude: location.lng });
      } else {
        setLocation({ latitude: 43.642567, longitude: -79.387054 }); // Fallback location
      }
    } catch (error) {
      setLocation({ latitude: 43.642567, longitude: -79.387054 }); // Fallback location
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    const heartRateRef = ref(database, 'heartRate');
    const unsubscribe = onValue(heartRateRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const { heartRate, timestamp, deviceIP } = data;

        if (heartRate && timestamp) {
          setHeartRateData((prev) => [...prev, heartRate]);
          setTimestamps((prev) => [...prev, new Date(timestamp).toLocaleTimeString()]);

          if (heartRate > threshold) {
            setAlert(true);
          } else {
            setAlert(false);
          }
        }

        if (deviceIP) {
          fetchLocationFromIP(deviceIP);
        }
      }
    });

    return () => unsubscribe();
  }, [threshold]);

  const calculateStats = () => {
    if (heartRateData.length === 0) return { max: 0, min: 0, avg: 0, current: 0 };

    const max = Math.max(...heartRateData);
    const min = Math.min(...heartRateData);
    const avg = (
      heartRateData.reduce((sum, rate) => sum + rate, 0) / heartRateData.length
    ).toFixed(1);
    const current = heartRateData[heartRateData.length - 1];

    return { max, min, avg, current };
  };

  const { max, min, avg, current } = calculateStats();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Heart Rate Monitor</Text>

      {/* Alert */}
      {alert && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            ⚠️ High Heart Rate Detected: {current} bpm exceeds {threshold} bpm!
          </Text>
        </View>
      )}

      {/* Threshold Input */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Set Alert Threshold (bpm)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={threshold.toString()}
          onChangeText={(value) => setThreshold(Number(value))}
          placeholder="Enter threshold"
        />
      </View>

      {/* Heart Rate Chart */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Heart Rate Chart</Text>
        <View style={styles.chartContainer}>
          <HeartRateChart heartRateData={heartRateData} timestamps={timestamps} />
        </View>
      </View>

      {/* Map and Stats */}
      <View style={styles.mapAndStats}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <Text style={styles.subtitle}>Location</Text>
          {loadingLocation ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : location ? (
            <MapComponent location={location} />
          ) : (
            <Text>Location not available...</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.subtitle}>Heart Rate Statistics</Text>
          <Text style={styles.stat}>Current: {current || 'N/A'} bpm</Text>
          <Text style={styles.stat}>Max: {max || 'N/A'} bpm</Text>
          <Text style={styles.stat}>Min: {min || 'N/A'} bpm</Text>
          <Text style={styles.stat}>Average: {avg || 'N/A'} bpm</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default HeartRateDisplay;

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  alertBox: {
    backgroundColor: '#ffcccc',
    borderColor: '#ff4d4d',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  alertText: {
    color: '#d9534f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapAndStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mapContainer: {
    width: '48%',
    height: 300,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 8,
  },
  statsContainer: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stat: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  chartContainer: {
    width: screenWidth - 32,
    height: 300,
    alignSelf: 'center',
  },
});
