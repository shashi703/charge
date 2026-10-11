import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ShopMap.css';

const defaultPosition = [17.385, 78.4867];

function MapResize() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function ShopMap() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadShops() {
      try {
        const response = await fetch('http://localhost:5000/api/shops');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load shops.');
        }

        setShops(data.shops || []);
      } catch (err) {
        setError('Could not load shops. Please check the backend.');
      } finally {
        setLoading(false);
      }
    }

    loadShops();
  }, []);

  const locatedShops = shops.filter((shop) => {
    const location = shop.location;
    return (
      location &&
      Number.isFinite(Number(location.latitude)) &&
      Number.isFinite(Number(location.longitude)) &&
      location.latitude !== '' &&
      location.longitude !== '' &&
      Number(location.latitude) >= -90 &&
      Number(location.latitude) <= 90 &&
      Number(location.longitude) >= -180 &&
      Number(location.longitude) <= 180
    );
  });

  return (
    <section className="shop-map-section">
      <div className="shop-map-heading">
        <p>EXPLORE YOUR AREA</p>
        <h2>Nearby Shops</h2>
        <span>Find registered shops on the map.</span>
      </div>

      {loading && <p>Loading registered shops...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && shops.length === 0 && (
        <p>No registered shops found yet.</p>
      )}

      {!loading && !error && shops.length > 0 && locatedShops.length === 0 && (
        <p>
          {shops.length} registered shop(s) found, but their map
          locations have not been added yet.
        </p>
      )}

      <div className="shop-map">
        <MapContainer
          center={defaultPosition}
          zoom={12}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <MapResize />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locatedShops.map((shop) => (
            <Marker
              key={shop.id}
              position={[
                Number(shop.location.latitude),
                Number(shop.location.longitude)
              ]}
              icon={L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })}
            >
              <Popup>
                <strong>{shop.shopName}</strong>
                <br />
                {shop.shopAddress}
                <br />
                <span>
                  {shop.shopStatus === 'approved'
                    ? 'Approved shop'
                    : 'Awaiting approval'}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {!loading && locatedShops.length > 0 && (
        <div className="shop-map-list">
          <h3>Shops with map locations</h3>
          {locatedShops.map((shop) => (
            <div className="shop-map-item" key={shop.id}>
              <strong>{shop.shopName}</strong>
              <p>{shop.shopAddress}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ShopMap;