import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import api from '../api';

function Form({route, method}) {
    const name = method === 'login' ? 'Login' : 'Register';


    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [profile_image, setProfileImage] = useState("");
    //const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name === 'Register') {
            try {
                const response = await api.post(route, { username, email, password });
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

                navigate("/login");
            } catch (error) {
                alert(error);
            }

        }
        else {
            try {
                const response = await api.post(route, { username, password });
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                localStorage.setItem('username', username); // Store username
                navigate("/home");
            } catch (error) {
                alert(error);
            }
        }};



    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col space-y-4">
                <h1 className="text-white text-center" >
                    {name}
                </h1>
                <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
                    <input
                        className="border p-2"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        required
                    />
                    {name === 'Register' &&
                        (<input
                        className="border p-2"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                    />)}
                    <input
                        className="border p-2"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                    />

                    <button className="bg-red-500 rounded p-2" type="submit">
                        {name}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Form;