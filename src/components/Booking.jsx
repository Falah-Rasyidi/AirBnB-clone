import { useReducer } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const initialBooking = {
    checkIn: "",
    checkOut: "",
    name: "",
    email: "",
    daytime: "",
    mobile: "",
    postal: "",
    residential: ""
}

const reducer = (booking, action) => {
    switch (action.type) {
        case "UPDATE":
            return {
                ...booking,
                [action.field]: action.value,
            };
        default:
            return booking;
    }
}

const Booking = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    
    const [booking, dispatch] = useReducer(reducer, initialBooking);

    // This object stores the label of each field as its key
    // The values are an array where [0] is the input type and [1] is the key of the booking object
    const bookingDetails = {
        "Check-in": ["date", "Enter check-in date", "checkIn"],
        "Check-out": ["date", "Enter check-out date", "checkOut"],
        "Name": ["text", "Enter your name", "name"],
        "Email address": ["email", "Enter your email address", "email"],
        "Daytime phone number": ["tel", "Enter your daytime phone number", "daytime"],
        "Mobile number": ["tel", "Enter your mobile number", "mobile"],
        "Postal address": ["text", "Enter your postal address", "postal"],
        "Residential address": ["text", "Enter your residential address", "residential"]
    }

    const handleUpdate = (field, value) => {
        dispatch({ type: "UPDATE", field: field, value: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Add listing ID
            const newBooking = {
                ...booking,
                listingID: params.get("listing_id")
            }
            
            await fetch("http://localhost:5000/book", { 
                method: 'POST',
                body: new URLSearchParams({ ...newBooking })
            });

            navigate("/confirmation");
        } catch (e) {
            console.error("Error making a booking (frontend)", e);
        }
    }

    return (
        <>
        <div className="body-section">
            <a href="http://localhost:3000/"><button>Return to homepage</button></a>
            <h1>Let's book the property</h1>
            <section>
                <form className="form" onSubmit={handleSubmit}>
                    { Object.keys(bookingDetails).map((key) => 
                    <div>
                        <label>{ key }</label>
                        <input type={ bookingDetails[key][0] }
                               placeholder={ bookingDetails[key][1] } 
                               onChange={(e) => {handleUpdate(bookingDetails[key][2], e.target.value)}} 
                               required
                        />
                    </div>
                    )}

                    <button type="submit">Create booking</button>
                </form>
            </section>
        </div>
        </>
    );
}

export default Booking;