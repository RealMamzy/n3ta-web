import React, { useEffect, useState } from "react";
import { supabase } from "./supabase"; // Import Supabase client
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Leaflet imports
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS

function App() {
    const [districts, setDistricts] = useState([]); // State to store districts
    const [loading, setLoading] = useState(true);  // State to handle loading
    const [error, setError] = useState(""); // State to handle errors

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('districts') // Fetch data from 'districts' table
                    .select('*');
                
                if (error) {
                    throw new Error(error.message);
                }

                const formattedData = data.map((district) => {
                    const zones = district.Zones; // Get zones from the data

                    if (!Array.isArray(zones) || !zones.every(item => Array.isArray(item) && item.length === 2)) {
                        throw new Error("Zones should be an array of arrays with 2 values (latitude and longitude).");
                    }

                    return { id: district.id, name: district.Name, zones };
                });

                setDistricts(formattedData);
            } catch (err) {
                setError(`Error loading data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>N3TA Districts</h1>

            {/* Display loading or error message */}
            {loading && <p>Loading districts...</p>}
            {error && <p>{error}</p>}

            {/* Map Container setup */}
            <MapContainer
                center={[30.0330, 31.2330]} // Adjust this to the center of your data (for Cairo, Egypt in this case)
                zoom={12}
                style={{ width: '100%', height: '500px' }} // Set width and height for the map
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Using OpenStreetMap for tiles
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Loop through districts and add markers for each zone */}
                {districts.map(district => (
                    district.zones.map((zone, index) => (
                        <Marker
                            key={`${district.id}-${index}`}
                            position={[zone[0], zone[1]]} // Latitude and Longitude from geopoint array
                        >
                            <Popup>{district.name} - Zone {index + 1}</Popup>
                        </Marker>
                    ))
                ))}
            </MapContainer>

            {/* List of districts */}
            <ul>
                {districts.map(district => (
                    <li key={district.id}>{district.name}</li> // Display district names
                ))}
            </ul>
        </div>
    );
}

export default App;