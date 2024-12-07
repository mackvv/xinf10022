import React, { useEffect, useRef } from 'react';

const MapComponent = ({ location }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!location) {
      console.error('Location is not available');
      return;
    }

    const initializeMap = () => {
      if (!mapRef.current) {
        console.error('Map container (mapRef.current) is null.');
        return;
      }

      console.log('Initializing Map...');
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 14, // Adjust zoom level for better visibility
      });

      console.log('Map initialized successfully.');

      // Add a standard marker
      new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: 'Your Location',
      });
    };

    const loadGoogleMaps = () => {
      if (document.getElementById('google-maps-script')) {
        console.log('Google Maps script already loaded.');
        window.initializeMap = initializeMap;
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDJWvoPpu8FKxqUhx1YFertAXmkDc3rlt0`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps script.');
      };
      script.id = 'google-maps-script';
      document.body.appendChild(script);
    };

    if (!window.google || !window.google.maps) {
      console.log('Loading Google Maps script...');
      loadGoogleMaps();
    } else {
      console.log('Google Maps already loaded. Initializing map...');
      initializeMap();
    }
  }, [location]);

  return (
    <div
      ref={mapRef}
      style={{
        height: '400px', // Ensure a proper height
        width: '400px', // Full width
        borderRadius: '10px', // Optional styling
        overflow: 'hidden', // Prevent overflow
        backgroundColor: '#f0f0f0', // Debugging background color
      }}
    ></div>
  );
};

export default MapComponent;
