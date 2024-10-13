import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../../api.js";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ProfileEdit() {
    const id = localStorage.getItem('user_id');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        profile_image: "",
        bio: "",
        is_public: false,
    });
    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get(`/user/profile/${id}/`);
            if (response.status === 200) {
                const {username, profile_image, bio, anime_list_public} = response.data;
                setFormData({
                    username: username || "",
                    profile_image: profile_image || "",
                    bio: bio || "",
                    is_public: anime_list_public || false,
                });
                setPreviewImage(profile_image);
            } else {
                console.error("Error fetching user profile");
            }
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevData => ({...prevData, [name]: value}));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({...prevData, profile_image: file}));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('bio', formData.bio);
        formDataToSend.append('anime_list_public', formData.is_public);
        if (formData.profile_image instanceof File) {
            formDataToSend.append('profile_image', formData.profile_image);
        }

        try {
            const response = await api.put(`/user/profile/${id}/update/`, formDataToSend, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            if (response.status === 200) {
                console.log("Profile updated successfully");
                localStorage.setItem('username', formData.username);
                localStorage.setItem('profile_image', formData.profile_image);
                localStorage.setItem('bio', formData.bio);
                localStorage.setItem('anime_list_public', formData.is_public);
                toast.success("Profile updated successfully");
            } else {
                console.error("Error updating profile");
            }
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleTogglePublic = async () => {
        const updatedIsPublic = !formData.is_public;
        setFormData(prevData => ({...prevData, is_public: updatedIsPublic}));

        try {
            const response = await api.patch(`/user/profile/${id}/update/`, {
                anime_list_public: updatedIsPublic,

            });

            if (response.status === 200) {
                console.log("Anime list visibility updated successfully");
                toast.success("Anime list visibility updated successfully")
            } else {
                console.log("Error updating anime list visibility");
            }
        } catch (error) {
            console.error("There was an error updating the anime list visibility!", error);
        }
    };

    return (
        <div className="min-h-screen primary_bg flex flex-col items-center">
            <header className="text-center mt-6">
                <h2 className="font-bold text-2xl primary_text">Edit Profile</h2>
            </header>
            <div className="primary_form_bg text-gray-800 rounded-lg shadow-lg p-8 md:w-1/2 mt-6">
                <div className="flex flex-col items-center">
                    <img
                        src={previewImage || "/default-profile.png"}
                        alt="profile"
                        className="rounded-full w-32 h-32 object-cover mb-4 shadow-lg"
                    />
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="mb-6">
                            <label htmlFor="username"
                                   className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="mt-2 w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700">Profile
                                Picture</label>
                            <input
                                type="file"
                                id="profile_image"
                                name="profile_image"
                                onChange={handleFileChange}
                                className="mt-2 w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                className="mt-2 w-full p-3 border border-gray-300 rounded-md"
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <button
                                type="button"
                                onClick={handleTogglePublic}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-full shadow-lg"
                            >
                                {formData.is_public ? "Make Private" : "Make Public"}
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-full shadow-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-full mt-6 shadow-lg"
                    >
                        Logout
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-full mt-6 shadow-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
}

export default ProfileEdit;