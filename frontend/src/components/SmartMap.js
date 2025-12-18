import React, { useState, useEffect, useRef } from 'react';
import './SmartMap.css';

const SmartMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // College location coordinates
  const collegeLocation = {
    lat: 29.4160459,
    lng: 80.0777467,
    name: 'Government Polytechnic, Lohaghat',
    address: 'Lohaghat, Champawat, Uttarakhand 262524'
  };

  // Smart locations (departments, facilities) - UPDATED with all branches
  const smartLocations = [
    {
      id: 1,
      name: 'Main Building (L-Shaped)',
      type: 'building',
      lat: 29.4160459,
      lng: 80.0777467,
      icon: '🏢',
      description: 'Main administrative building with Principal Office, Admin Office, and Staff Rooms',
      facilities: ['Principal Office', 'Admin Office', 'Staff Room', 'Classrooms (20+)', 'Computer Labs'],
      googleMapsLink: 'https://www.google.com/maps?q=29.4160459,80.0777467'
    },
    {
      id: 2,
      name: 'Information Technology (IT) Department',
      type: 'department',
      branch: 'IT',
      lat: 29.41625,
      lng: 80.07795,
      icon: '💻',
      description: 'IT Department with Programming Labs, Database Lab, Web Development Lab',
      facilities: ['Computer Lab (20 PCs)', 'Programming Lab', 'Database Lab', 'Web Dev Lab', 'Faculty Offices'],
      hod: 'Mr. Govind Ballabh Pant',
      students: 95,
      faculty: 4,
      googleMapsLink: 'https://www.google.com/maps?q=29.41625,80.07795',
      architecture: {
        floors: 2,
        rooms: ['Lab 1 (Ground Floor)', 'Lab 2 (First Floor)', 'HOD Office', 'Faculty Room', 'Server Room'],
        layout: 'Rectangular building with 2 floors, entrance facing main road'
      }
    },
    {
      id: 3,
      name: 'Civil Engineering Department',
      type: 'department',
      branch: 'CIVIL',
      lat: 29.41615,
      lng: 80.07785,
      icon: '🏗️',
      description: 'Civil Engineering Department with Construction Lab, Surveying Equipment',
      facilities: ['Construction Lab', 'Surveying Lab', 'Material Testing Lab', 'Drawing Hall', 'Workshop'],
      hod: 'Dr. Ramesh Kumar',
      students: 85,
      faculty: 5,
      googleMapsLink: 'https://www.google.com/maps?q=29.41615,80.07785',
      architecture: {
        floors: 2,
        rooms: ['Workshop (Ground Floor)', 'Labs (First Floor)', 'HOD Office', 'Faculty Rooms', 'Store Room'],
        layout: 'Large workshop on ground floor, labs and offices on first floor'
      }
    },
    {
      id: 4,
      name: 'Electronics Engineering Department',
      type: 'department',
      branch: 'ELECTRONICS',
      lat: 29.41618,
      lng: 80.07788,
      icon: '⚡',
      description: 'Electronics Department with Circuit Labs, Embedded Systems Lab',
      facilities: ['Circuit Lab', 'Embedded Systems Lab', 'Digital Electronics Lab', 'Microcontroller Lab', 'Workshop'],
      hod: 'Dr. Ashok Menon',
      students: 75,
      faculty: 5,
      googleMapsLink: 'https://www.google.com/maps?q=29.41618,80.07788',
      architecture: {
        floors: 2,
        rooms: ['Electronics Lab (Ground)', 'Embedded Lab (First)', 'HOD Office', 'Faculty Rooms', 'Equipment Room'],
        layout: 'Two-story building with specialized labs for electronics and embedded systems'
      }
    },
    {
      id: 9,
      name: 'Pharmacy Department',
      type: 'department',
      branch: 'PHARMACY',
      lat: 29.41622,
      lng: 80.07792,
      icon: '💊',
      description: 'Pharmacy Department with Drug Formulation Lab, Chemistry Lab',
      facilities: ['Pharmaceutical Lab', 'Chemistry Lab', 'Drug Store', 'Research Lab', 'Dispensing Lab'],
      hod: 'Dr. Lakshmi Pillai',
      students: 88,
      faculty: 5,
      googleMapsLink: 'https://www.google.com/maps?q=29.41622,80.07792',
      architecture: {
        floors: 2,
        rooms: ['Chemistry Lab (Ground)', 'Pharmacy Lab (First)', 'HOD Office', 'Faculty Rooms', 'Storage'],
        layout: 'Modern building with specialized pharmaceutical laboratories and storage facilities'
      }
    },
    {
      id: 10,
      name: 'Mechanical Engineering Department',
      type: 'department',
      branch: 'MECHANICAL',
      lat: 29.41612,
      lng: 80.07782,
      icon: '🔧',
      description: 'Mechanical Engineering Department with Manufacturing Lab, Machine Shop',
      facilities: ['Machine Shop', 'Manufacturing Lab', 'CAD Lab', 'Workshop', 'Tool Room'],
      hod: 'Dr. Prabhu Modi',
      students: 78,
      faculty: 4,
      googleMapsLink: 'https://www.google.com/maps?q=29.41612,80.07782',
      architecture: {
        floors: 2,
        rooms: ['Machine Shop (Ground)', 'CAD Lab (First)', 'HOD Office', 'Faculty Rooms', 'Tool Storage'],
        layout: 'Large workshop on ground floor with heavy machinery, labs and offices above'
      }
    },
    {
      id: 5,
      name: 'Library (2 Floors)',
      type: 'facility',
      lat: 29.4159,
      lng: 80.0780,
      icon: '📚',
      description: 'Central Library with 50,000+ books, Reading Hall, Digital Section',
      facilities: ['Reading Hall (Ground Floor)', 'Reference Section (First Floor)', 'Digital Section', 'E-Learning Zone'],
      googleMapsLink: 'https://www.google.com/maps?q=29.4159,80.0780',
      architecture: {
        floors: 2,
        rooms: ['Reading Hall (Ground)', 'Reference Library (First)', 'Digital Section', 'Admin Office', 'Stack Room'],
        layout: 'Two-story library building with reading halls and digital resources'
      }
    },
    {
      id: 6,
      name: 'Cafeteria',
      type: 'facility',
      lat: 29.4163,
      lng: 80.0781,
      icon: '🍽️',
      description: 'College Cafeteria with Dining Hall and Kitchen',
      facilities: ['Dining Hall', 'Kitchen', 'Rest Area', 'Outdoor Seating'],
      googleMapsLink: 'https://www.google.com/maps?q=29.4163,80.0781'
    },
    {
      id: 7,
      name: 'Hostel Block',
      type: 'facility',
      lat: 29.4165,
      lng: 80.0783,
      icon: '🏠',
      description: 'Student Hostel with Boys and Girls Blocks',
      facilities: ['Boys Hostel (3 Floors)', 'Girls Hostel (3 Floors)', 'Common Area', 'Mess', 'Recreation Room'],
      googleMapsLink: 'https://www.google.com/maps?q=29.4165,80.0783',
      architecture: {
        floors: 3,
        rooms: ['Boys Block (Left)', 'Girls Block (Right)', 'Warden Office', 'Mess Hall', 'Common Rooms'],
        layout: 'Two separate 3-story buildings with common facilities'
      }
    },
    {
      id: 8,
      name: 'Sports Ground',
      type: 'facility',
      lat: 29.4167,
      lng: 80.0785,
      icon: '⚽',
      description: 'Sports and Recreation Area',
      facilities: ['Cricket Ground', 'Basketball Court', 'Volleyball Court', 'Badminton Court'],
      googleMapsLink: 'https://www.google.com/maps?q=29.4167,80.0785'
    },
    {
      id: 11,
      name: 'Parking Area',
      type: 'facility',
      lat: 29.4160,
      lng: 80.0775,
      icon: '🚗',
      description: 'Parking Facility',
      facilities: ['Student Parking', 'Visitor Parking', 'Faculty Parking', 'Two-Wheeler Zone'],
      googleMapsLink: 'https://www.google.com/maps?q=29.4160,80.0775'
    }
  ];

  // Load Google Maps script (only once per page)
  useEffect(() => {
    const handleScriptLoad = () => {
      setMapLoaded(true);
    };

    const existingScript = document.querySelector('script[data-google-maps="true"]');

    if (window.google && window.google.maps) {
      // Already loaded
      setMapLoaded(true);
    } else if (existingScript) {
      // Script tag already present, just wait for it
      existingScript.addEventListener('load', handleScriptLoad);
    } else {
      // Inject script only once
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbKUYiPOK8'}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = 'true';
      script.addEventListener('load', handleScriptLoad);
      document.head.appendChild(script);
    }

    // Get user's current location (real-time)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }

    return () => {
      const existing = document.querySelector('script[data-google-maps="true"]');
      if (existing) {
        existing.removeEventListener('load', handleScriptLoad);
      }
    };
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && !map && window.google) {
      initMap();
    }
  }, [mapLoaded]);

  const initMap = () => {
    if (!window.google || mapRef.current === null) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: collegeLocation.lat, lng: collegeLocation.lng },
      zoom: 17,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Add main college marker
    const mainMarker = new window.google.maps.Marker({
      position: { lat: collegeLocation.lat, lng: collegeLocation.lng },
      map: mapInstance,
      title: collegeLocation.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
            <text x="24" y="32" font-size="24" text-anchor="middle" fill="white">🎓</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24)
      },
      animation: window.google.maps.Animation.DROP
    });

    const mainInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="map-info-window">
          <h3>${collegeLocation.name}</h3>
          <p>${collegeLocation.address}</p>
          <button onclick="window.getDirections('${collegeLocation.lat},${collegeLocation.lng}')" class="directions-btn">
            📍 Get Directions
          </button>
        </div>
      `
    });

    mainMarker.addListener('click', () => {
      mainInfoWindow.open(mapInstance, mainMarker);
      setSelectedLocation(collegeLocation);
    });

    // Add smart location markers
    smartLocations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstance,
        title: location.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
              <text x="20" y="28" font-size="20" text-anchor="middle" fill="white">${location.icon}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        },
        animation: window.google.maps.Animation.DROP
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="map-info-window">
            <div class="info-header">
              <span class="location-icon">${location.icon}</span>
              <h3>${location.name}</h3>
            </div>
            <p class="location-type">${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</p>
            <p>${location.description}</p>
            <div class="facilities-list">
              <strong>Facilities:</strong>
              <ul>
                ${location.facilities.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
            <button onclick="window.selectLocation(${location.id})" class="select-location-btn">
              🎯 Select Location
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
        setSelectedLocation(location);
      });
    });

    // Make functions globally available
    window.selectLocation = (locationId) => {
      const loc = smartLocations.find(l => l.id === locationId);
      if (loc) {
        setSelectedLocation(loc);
        mapInstance.setCenter({ lat: loc.lat, lng: loc.lng });
        mapInstance.setZoom(19);
      }
    };

    window.getDirections = (destination) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      window.open(url, '_blank');
    };
  };

  // Add user location marker when available
  useEffect(() => {
    if (map && userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        animation: window.google.maps.Animation.BOUNCE
      });

      const accuracyCircle = new window.google.maps.Circle({
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: userLocation.accuracy || 50,
        map: map,
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        strokeColor: '#ef4444',
        strokeOpacity: 0.5,
        strokeWeight: 2
      });

      return () => {
        userMarker.setMap(null);
        accuracyCircle.setMap(null);
      };
    }
  }, [map, userLocation]);

  const handleLocationSearch = (query) => {
    if (!map || !window.google) return;

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      query: query,
      location: { lat: collegeLocation.lat, lng: collegeLocation.lng },
      radius: 5000
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const place = results[0];
        map.setCenter(place.geometry.location);
        map.setZoom(18);
      }
    });
  };

  return (
    <div className="smart-map-container">
      <div className="map-controls">
        <div className="control-header">
          <h3>🗺️ Smart Campus Map</h3>
          <div className="location-status">
            {userLocation ? (
              <span className="status-badge active">📍 Live Location Active</span>
            ) : (
              <span className="status-badge">📍 Location Permission Needed</span>
            )}
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search locations, departments, facilities..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLocationSearch(e.target.value);
              }
            }}
            className="map-search-input"
          />
        </div>

        <div className="smart-locations-list">
          <h4>Smart Locations</h4>
          <div className="locations-grid">
            {smartLocations.map((location) => (
              <button
                key={location.id}
                className={`location-card ${selectedLocation?.id === location.id ? 'active' : ''}`}
                onClick={() => {
                  if (map) {
                    map.setCenter({ lat: location.lat, lng: location.lng });
                    map.setZoom(19);
                    setSelectedLocation(location);
                    
                    // Trigger marker click to show info window
                    setTimeout(() => {
                      const markers = document.querySelectorAll(`[title="${location.name}"]`);
                      if (markers.length > 0) {
                        markers[0].click();
                      }
                    }, 300);
                  }
                }}
              >
                <span className="card-icon">{location.icon}</span>
                <div className="card-content">
                  <strong>{location.name}</strong>
                  <span className="card-type">{location.type} {location.branch ? `(${location.branch})` : ''}</span>
                  {location.hod && <span style={{fontSize: '0.75rem', color: '#6b7280'}}>HOD: {location.hod}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedLocation && (
          <div className="selected-location-info">
            <h4>Selected Location</h4>
            <div className="info-box">
              <div className="info-header">
                <span className="info-icon">{selectedLocation.icon}</span>
                <div>
                  <h5>{selectedLocation.name}</h5>
                  <p>{selectedLocation.description}</p>
                </div>
              </div>
              {selectedLocation.branch && (
                <div className="branch-info-section" style={{background: '#f3f4f6', padding: '1rem', borderRadius: '8px', margin: '1rem 0'}}>
                  <strong style={{color: '#1e3a8a'}}>📚 Branch Information:</strong>
                  <p><strong>Branch Code:</strong> {selectedLocation.branch}</p>
                  {selectedLocation.hod && <p><strong>HOD:</strong> {selectedLocation.hod}</p>}
                  {selectedLocation.students && <p><strong>Total Students:</strong> {selectedLocation.students}</p>}
                  {selectedLocation.faculty && <p><strong>Faculty Members:</strong> {selectedLocation.faculty}</p>}
                </div>
              )}
              {selectedLocation.architecture && (
                <div className="architecture-section" style={{background: '#eff6ff', padding: '1rem', borderRadius: '8px', margin: '1rem 0', borderLeft: '4px solid #3b82f6'}}>
                  <strong style={{color: '#1e3a8a'}}>🏗️ Building Architecture:</strong>
                  <p><strong>Floors:</strong> {selectedLocation.architecture.floors}</p>
                  <p><strong>Layout:</strong> {selectedLocation.architecture.layout}</p>
                  <details style={{marginTop: '8px'}}>
                    <summary style={{cursor: 'pointer', color: '#3b82f6', fontWeight: '600'}}>View All Rooms</summary>
                    <ul style={{marginTop: '8px', paddingLeft: '20px'}}>
                      {selectedLocation.architecture.rooms.map((room, idx) => (
                        <li key={idx} style={{margin: '3px 0'}}>{room}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
              <div className="facilities-section">
                <strong>✨ Facilities:</strong>
                <ul>
                  {selectedLocation.facilities?.map((facility, idx) => (
                    <li key={idx}>{facility}</li>
                  ))}
                </ul>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button
                  className="directions-button"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`;
                    window.open(url, '_blank');
                  }}
                  style={{flex: 1}}
                >
                  📍 Get Directions
                </button>
                {selectedLocation.googleMapsLink && (
                  <button
                    className="directions-button"
                    onClick={() => {
                      window.open(selectedLocation.googleMapsLink, '_blank');
                    }}
                    style={{flex: 1, background: '#10b981'}}
                  >
                    🗺️ Open in Maps
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="map-features">
          <h4>Map Features</h4>
          <div className="features-list">
            <button
              className="feature-btn"
              onClick={() => {
                if (map && userLocation) {
                  map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
                  map.setZoom(18);
                }
              }}
            >
              📍 Show My Location
            </button>
            <button
              className="feature-btn"
              onClick={() => {
                if (map) {
                  map.setCenter({ lat: collegeLocation.lat, lng: collegeLocation.lng });
                  map.setZoom(17);
                }
              }}
            >
              🎓 Back to College
            </button>
            <button
              className="feature-btn"
              onClick={() => {
                if (map) {
                  const bounds = new window.google.maps.LatLngBounds();
                  smartLocations.forEach(loc => {
                    bounds.extend({ lat: loc.lat, lng: loc.lng });
                  });
                  map.fitBounds(bounds);
                }
              }}
            >
              🗺️ Show All Locations
            </button>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <div ref={mapRef} className="smart-map" />
        {!mapLoaded && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Loading Smart Map...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMap;

