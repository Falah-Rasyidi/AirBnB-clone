import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PulseLoader } from "react-spinners";

const Homepage = (props) => {
    // Set up variables and values
    const propertyOptions = { 
        "Select a property type": "Select a property type",
        "Apartment hotel": "Aparthotel",
        "Apartment": "Apartment",
        "Barn": "Barn",
        "Bed and breakfast": "Bed and breakfast",
        "Boat": "Boat",
        "Boutique hotel": "Boutique hotel",
        "Bungalow": "Bungalow",
        "Cabin": "Cabin",
        "Camper / RV": "Camper/RV",
        "Campsite": "Campsite",
        "Casa particular": "Casa particular (Cuba)",
        "Castle": "Castle",
        "Chalet": "Chalet",
        "Condominium": "Condominium",
        "Cottage": "Cottage",
        "Earth house": "Earth house",
        "Farm stay": "Farm stay",
        "Guest suite": "Guest suite",
        "Guesthouse": "Guesthouse",
        "Heritage hotel": "Heritage hotel (India)",
        "Hostel": "Hostel",
        "Hotel": "Hotel",
        "House": "House",
        "Houseboat": "Houseboat",
        "Hut": "Hut",
        "Loft": "Loft",
        "Nature Lodge": "Nature Lodge",
        "Other property types": "Other",
        "Pension": "Pension (South Korea)",
        "Resort": "Resort",
        "Serviced apartment": "Serviced apartment",
        "Tiny house": "Tiny house",
        "Townhouse": "Townhouse",
        "Train": "Train",
        "Treehouse": "Treehouse",
        "Villa": "Villa"
    }
    const bedroomsOptions = [ "Select the number of bedrooms", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20 ];

    const [location, setLocation] = useState("");
    const [property, setProperty] = useState(propertyOptions["Select a property type"]);
    const [bedrooms, setBedrooms] = useState(bedroomsOptions[0]);
    const [listings, setListings] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    // Use effect to get twenty random listings when page first loads
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:5000/random-listings", {
                    method: 'GET',
                });

                setListings(await res.json());
            } catch (e) {
                console.log("Error getting random listings (frontend)", e);
            }
        }

        fetchData();
    }, []);

    // Query listings after user submits data
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setIsLoading(true);

            const res = await fetch("http://localhost:5000/search", {
                method: 'POST',
                body: new URLSearchParams({ location: location.trim(), property: property, bedrooms: bedrooms })
            });

            setIsLoading(false);
            setListings(await res.json());
        } catch (e) {
            console.error("Error getting bookings (frontend)", e);
        }
    }

    return (
        <>
        <div className="body-section">
            <h1>AirBnB 🍃</h1>
            <section>
                <form className="form" onSubmit={handleSubmit}>
                    <div>
                        <label>Location*</label>
                        <input type="text" 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            placeholder="Enter a location"
                            required
                        />
                    </div>

                    <div>
                        <label>Property type</label>
                        <select onChange={(e) => setProperty(propertyOptions[e.target.value])}>
                            { Object.keys(propertyOptions).map((option, idx) => (<option key={idx}>{option}</option>)) }
                        </select>
                    </div>

                    <div>
                        <label>No. of bedrooms</label>
                        <select onChange={(e) => setBedrooms(e.target.value)}>
                            { bedroomsOptions.map((option, idx) => (<option key={idx}>{option}</option>)) }
                        </select>
                    </div>

                    <button type="submit">Search</button>
                </form>
            </section>

            <div className="separator"></div>

            { listings.length === 1 ? <h3 className="result-number">{listings.length} result shown</h3> : <h3 className="result-number">{listings.length} results shown</h3> }
            { isLoading ? <PulseLoader size="20" margin="50" color="#6B9461" cssOverride={{ "textAlign": "center" }}/> : 
            <section className="results">
                { listings.map(listing => 
                <div>
                    <h3><Link to={`/bookings?listing_id=${listing._id}`}>{listing.name ? listing.name : "<No name available>"}</Link></h3>
                    <p className="grey"><strong>Daily rate:</strong> ${listing.price.$numberDecimal ? listing.price.$numberDecimal : "<No price available>"}</p>
                    <p className="grey"><strong>Customer rating:</strong> {listing.review_scores.review_scores_rating ? listing.review_scores.review_scores_rating + "⭐": "<No rating available>"}</p>
                    <p className="summary">{listing.summary ? listing.summary : "<No summary available>"}</p>
                </div>
                )}
            </section>
            }
        </div>
        </>
    );
}

export default Homepage;