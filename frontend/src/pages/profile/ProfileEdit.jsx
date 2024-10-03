import React, { useState, useEffect } from "react";
import api from "../../api.js";

function ProfileEdit() {
    const id = localStorage.getItem('user_id');
    const [bio, setBio] = useState(" ");
    const [pfp, setPfp] = useState(" ");
    const [nickname, setNickname] = useState(" ");
    const [formData, setFormData] = useState({
        username: nickname || "",
        profile_image: pfp || "",
        bio: bio || "",
    });

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        const response = await api.get(`/user/profile/${id}/`);
        if (response.status === 200) {
            console.log(response.data);
            setBio(response.data.bio);
            setPfp(response.data.profile_image);
            setNickname(response.data.username);
            setFormData({
                username: response.data.username || "",
                profile_image: response.data.profile_image || "",
                bio: response.data.bio || "",
            });
        } else {
            console.log("Error fetching recent anime");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData((prevData) => ({
                ...prevData,
                [name]: files[0],  // Save the file, not URL.createObjectURL
            }));
            if (name === 'profile_image') setPfp(URL.createObjectURL(files[0]));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('bio', formData.bio);
        if (formData.profile_image && formData.profile_image instanceof File) {
            formDataToSend.append('profile_image', formData.profile_image);
        }

        try {
            const response = await api.put(`user/profile/${id}/update/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                console.log("Profile updated successfully");
                localStorage.setItem('id', id);
                localStorage.setItem('username', formData.username);
                localStorage.setItem('profile_image', formData.profile_image);
                localStorage.setItem('bio', formData.bio);
            } else {
                console.log("Error updating profile");
            }
        } catch (error) {
            console.error("There was an error updating the profile!", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-violet-500">
            <header className="text-center">
                <h2 className="font-bold text-xl pt-2">Edit Profile</h2>
            </header>
            <div>
                <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6 md:w-1/2 max-h-fit mx-auto">
                    <div className="flex flex-col items-center">
                        <img
                            src={pfp}
                            alt="profile"
                            className="rounded-full w-32 h-32 object-cover mb-4 shadow-lg"
                        />
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700">Profile Picture</label>
                                <input
                                    type="file"
                                    id="profile_image"
                                    name="profile_image"
                                    onChange={handleFileChange}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={bio}
                                    onChange={handleInputChange}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                                    rows="4"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-full mt-6 shadow-lg transition duration-300"
                            >
                                Save Changes
                            </button>
                            <a className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-full mt-6 shadow-lg transition duration-300" href="/profile">Back</a>
                        </form>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-full mt-6 shadow-lg transition duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileEdit;