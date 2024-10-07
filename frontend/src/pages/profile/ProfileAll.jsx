import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from "../../api.js";

function ProfileAll() {
    const { userId } = useParams();
    const [bio, setBio] = useState('');
    const [pfp, setPfp] = useState('');
    const [nickname, setNickname] = useState('');
    const [recentAnime, setRecentAnime] = useState([]);

    useEffect(() => {
        if (userId) {
            fetchRecentAnime();
            fetchUserProfile();
        }
    }, [userId]);

    const fetchRecentAnime = async () => {
        try {
            const response = await api.get(`user/anime/recent/${userId}/`);
            if (response.status === 200) {
                setRecentAnime(response.data);
            } else {
                console.log("Error fetching recent anime");
            }
        } catch (error) {
            console.error("There was an error fetching the recent anime!", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await api.get(`/user/profile/${userId}/`);
            if (response.status === 200) {
                setBio(response.data.bio);
                setPfp(response.data.profile_image);
                setNickname(response.data.username);
            } else {
                console.log("Error fetching user profile");
            }
        } catch (error) {
            console.error("There was an error fetching the user profile!", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
            <header className="text-center py-6">
                <h2 className="font-bold text-3xl">Profile</h2>
            </header>
            <div className="flex flex-col md:flex-row w-full mx-auto gap-6 p-6">
                <div className="absolute top-8 left-8 flex justify-evenly">
                    <a className="bg-green-500 p-2 rounded" href="/home">Back</a>
                    <button className="bg-red-500 p-2 rounded mx-4" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>Logout</button>
                </div>
                <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6 md:w-1/2 max-h-fit">
                    <div className="flex flex-col items-center">
                        <img src={pfp} alt="profile" className="rounded-full w-32 h-32 object-cover mb-4 shadow-lg" />
                        <h2 className="font-bold text-2xl"><span className="text-indigo-600">{nickname}</span></h2>
                        <p className="text-lg mt-4"><span className="text-gray-600">{bio}</span></p>
                        <a href="">Follow</a>
                        <a href="">Add Friend</a>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4 text-gray-800">Recently Added</p>
                    <ul className="space-y-4">
                        {recentAnime.map((anime) => (
                            <li key={anime.mal_id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={anime.image_url} alt={anime.title} className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-indigo-600 hover:underline" href={`https://myanimelist.net/anime/${anime.mal_id}`} target="_blank" rel="noopener noreferrer">
                                        {anime.title}
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-black text-center font-semibold">Friends</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-black text-center font-semibold">Following</p>
                </div>
            </div>
        </div>
    );
}

export default ProfileAll;