import React, { useContext, useState } from 'react';
import Input from '../Input/Input';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import { API_PATHS } from '../../utils/apiPath';
import { userContext } from '../../content/Userprovider';

function Registeration() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [Location, setLocation] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    //   const { updateuser } = useContext(userContext);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullname) {
            setError("Please enter your name");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }
        if (!password) {
            setError("Please enter a valid Password");
            return;
        }
        setError("");

        // try {
        //   const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        //     fullname,
        //     email,
        //     password,
        //     profilepic
        //   });
        //   const { token, user } = response.data;
        //   if (token) {
        //     localStorage.setItem("token", token);
        //     updateUser(user);
        //     navigate("/dashboard");
        //   }
        // } catch (err) {
        //   if (err.response && err.response.data.message) {
        //     setError(err.response.data.message);
        //   } else {
        //     setError("Something went wrong. Please try again.");
        //   }
        // }
    };

    return (
        <div className="min-h-screen flex flex-col space-y-3 items-center justify-center bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-200">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                FixItNow
            </h1>

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-indigo-500">
                <h3 className="text-2xl text-indigo-700 font-bold text-center">Join FixItNow as a Servicer</h3>
                <p className="text-sm text-gray-600 text-center mt-2 mb-6">
                    Grow your service business with us. Enter your details below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        value={fullname}
                        onChange={({ target }) => setFullname(target.value)}
                        label="Full Name"
                        placeholder="Team 2"
                        type="text"
                    />
                    <Input
                        value={Location}
                        onChange={({ target }) => setLocation(target.value)}
                        label="Location"
                        placeholder="Trichy"
                        type="text"
                    />
                    <Input
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                        label="Email Address"
                        placeholder="team2@gmail.com"
                        type="text"
                    />
                    
                    <Input
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        label="Password"
                        placeholder="Min 8 characters"
                        type="password"
                    />

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                    >
                        Sign Up
                    </button>

                    <p className="text-center text-gray-700 text-sm mt-4">
                        Already have an account?{" "}
                        <Link className="font-medium text-indigo-600 underline" to={"/Login"}>
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>

    );
}

export default Registeration;
