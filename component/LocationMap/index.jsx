import React, { useCallback, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
} from "@react-google-maps/api";
import styles from "./locationMap.module.scss";
import Image from "next/image";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 25.2048,
  lng: 55.2708,
};

const mapOptions = {
  styles: [
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#e0e0e0" }, { lightness: 30 }, { weight: 0.5 }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry.stroke",
      stylers: [{ color: "#e0e0e0" }, { lightness: 30 }, { weight: 0.3 }],
    },
    {
      featureType: "road.local",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
    },
    {
      featureType: "road.local",
      elementType: "geometry.stroke",
      stylers: [{ color: "#e0e0e0" }, { lightness: 30 }, { weight: 0.2 }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }, { lightness: 21 }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#dedede" }, { lightness: 21 }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ saturation: 36 }, { color: "#666666" }, { lightness: 40 }],
    },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#f2f2f2" }, { lightness: 19 }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.fill",
      stylers: [{ color: "#fefefe" }, { lightness: 20 }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#e0e0e0" }, { lightness: 17 }, { weight: 0.5 }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

const locations = [];

function LocationMap({ location }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);

  // Transform API data to component format
  const getLocationFromAPI = React.useCallback((data) => {
    if (!data?.acf) return null;

    // Check for new repeater structure
    if (data.acf.location_list && Array.isArray(data.acf.location_list)) {
      const logo = data.acf.map_company_logo?.url || "/images/icons/khansaheb.svg";
      const logo_alt = data.acf.map_company_logo?.alt || "";

      const parsedLocations = data.acf.location_list.map((loc, index) => {
        const lat = parseFloat(loc.map_latitude);
        const lng = parseFloat(loc.map_longitude);

        if (isNaN(lat) || isNaN(lng) || !lat || !lng) return null;

        return {
          id: `api-${index}`,
          name: loc.map_location || "Khansaheb Investment L.L.C.",
          address: loc.map_address || "",
          phone: (loc.map_phone || "").split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean),
          email: (loc.map_email || "").split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean),
          lat: lat,
          lng: lng,
          logo: logo,
          logo_alt: logo_alt
        };
      }).filter(Boolean);

      return parsedLocations.length > 0 ? parsedLocations : null;
    }

    // Fallback to old structure
    const lat = parseFloat(data.acf.map_latitude);
    const lng = parseFloat(data.acf.map_longitude);

    // Only return location if we have valid coordinates
    if (isNaN(lat) || isNaN(lng) || !lat || !lng) return null;

    return [{
      id: 1,
      name: data.acf.map_location || "Khansaheb Investment L.L.C.",
      address: data.acf.map_address || "",
      phone: (data.acf.map_phone || "").split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean),
      email: (data.acf.map_email || "").split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean),
      lat: lat,
      lng: lng,
      logo: data.acf.map_company_logo?.url || "/images/icons/khansaheb.svg",
      logo_alt: data.acf.map_company_logo?.alt || "",
    }];
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAZY9WW5ucJZLvBYxY4cAeZYY8AvmjZygg",
    libraries,
  });

  const onLoad = useCallback((map) => {
    setMap(map);
    // Set initial center only once when map loads
    // If we have a location prop, use it; otherwise use default center
    if (location) {
      const apiLocations = getLocationFromAPI(location);
      if (apiLocations && apiLocations.length > 0) {
        setMapCenter({ lat: apiLocations[0].lat, lng: apiLocations[0].lng });
      } else if (location.lat && location.lng) {
        setMapCenter({ lat: location.lat, lng: location.lng });
      }
    }
  }, [location, getLocationFromAPI]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Helper function to calculate distance between two coordinates (in kilometers)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMarkerClick = (markerLocation) => {
    if (!map) {
      setSelectedLocation(markerLocation);
      return;
    }

    // Determine which locations to show - if we have API data with valid coordinates, show only that
    const apiLocations = getLocationFromAPI(location);
    const currentDisplayLocations = apiLocations && apiLocations.length > 0 ? apiLocations : locations;

    // Get current zoom level
    const currentZoom = map.getZoom();

    // Check if there are nearby markers (within 2km)
    const nearbyMarkers = currentDisplayLocations.filter((loc) => {
      if (loc.id === markerLocation.id) return false;
      const distance = calculateDistance(
        markerLocation.lat,
        markerLocation.lng,
        loc.lat,
        loc.lng
      );
      return distance < 2; // 2km threshold
    });

    // If there are nearby markers and map is not zoomed in enough, just zoom without opening InfoWindow
    if (nearbyMarkers.length > 0 && currentZoom < 15) {
      // Smoothly pan to the clicked marker (panTo animates smoothly)
      map.panTo({ lat: markerLocation.lat, lng: markerLocation.lng });
      
      // Set zoom to a moderate level (15) to separate markers without zooming too much
      // Use a slight delay to allow pan animation to start, then animate zoom
      setTimeout(() => {
        const targetZoom = 15;
        const zoomStep = currentZoom < targetZoom ? 1 : -1;
        const animateZoom = () => {
          const current = map.getZoom();
          if ((zoomStep > 0 && current < targetZoom) || (zoomStep < 0 && current > targetZoom)) {
            map.setZoom(current + zoomStep);
            setTimeout(animateZoom, 50);
          }
        };
        animateZoom();
      }, 100);
      
      // Don't open InfoWindow - let user click again after zoom
      return;
    }

    // If no nearby markers or already zoomed in enough, show the InfoWindow
    // Also pan to center the marker if needed
    map.panTo({ lat: markerLocation.lat, lng: markerLocation.lng });
    setSelectedLocation(markerLocation);
  };

  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
  };

  // If location prop is passed, show it as the selected location
  React.useEffect(() => {
    if (location) {
      // Check if it's API data format or direct location object
      const apiLocations = getLocationFromAPI(location);
      if (apiLocations && apiLocations.length > 0) {
        // Don't auto-select unless it's a single location or desired behavior
        // If we want to behave like before (select the first one), uncomment below:
        // setSelectedLocation(apiLocations[0]);
      } else if (location.lat && location.lng) {
        // Direct location object (backward compatibility)
        setSelectedLocation(location);
      }
    }
  }, [location]);

  if (!isLoaded) {
    return <div className={styles.loading}>Loading map...</div>;
  }

  // Determine which locations to show - if we have API data with valid coordinates, show only that
  const apiLocations = getLocationFromAPI(location);
  const displayLocations = apiLocations && apiLocations.length > 0 ? apiLocations : locations;

  return (
    <div className={styles.locationMapContainer}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {displayLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={{ lat: loc.lat, lng: loc.lng }}
            onClick={() => handleMarkerClick(loc)}
            icon={{
              url: "/images/icons/khansaheb.svg",
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            }}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            key={selectedLocation.id}
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={handleInfoWindowClose}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
            }}
          >
            <div className={styles.infoWindow}>
              <button className={styles.close_button} onClick={()=>setSelectedLocation(null)}>
                X
              </button>
              <div className={styles.infoWindowHeader}>
                  <Image
                    src={selectedLocation.logo || "/images/icons/khansaheb.svg"}
                    alt={selectedLocation.logo_alt || selectedLocation.name || "Khansaheb company logo"}
                    width={35}
                    height={35}
                    unoptimized
                  />
                <div className={styles.companyInfo}>
                  <h3 className={styles.companyName}>{selectedLocation.name}</h3>
                </div>
              </div>
              <div className={styles.infoWindowContent}>
                {selectedLocation.address && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <Image src="/images/icons/location.svg" alt="Location icon" layout="fill" unoptimized />
                    </div>
                    <span className={styles.contactText}>{selectedLocation.address}</span>
                  </div>
                )}
                {selectedLocation.phone && selectedLocation.phone.length > 0 && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <Image src="/images/icons/call.svg" alt="Phone icon" layout="fill" unoptimized />
                    </div>
                    <div>
                      {selectedLocation.phone.map((phone, i) => (
                        <a key={i} href={`tel:${phone.replace(/\s+/g, '')}`} className={styles.contactText} style={{display: 'block'}}>{phone}</a>
                      ))}
                    </div>
                  </div>
                )}
                {selectedLocation.email && selectedLocation.email.length > 0 && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                     <Image src="/images/icons/mail.svg" alt="Email icon" layout="fill" unoptimized />
                    </div>
                    <div>
                      {selectedLocation.email.map((email, i) => (
                        <a key={i} href={`mailto:${email}`} className={styles.contactText} style={{display: 'block'}}>{email}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.triangle}></div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default LocationMap;
