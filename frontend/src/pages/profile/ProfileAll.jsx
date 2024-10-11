import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import api from "../../api.js";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ProfileAll() {
    const {userId} = useParams();

    const [profileData, setProfileData] = useState({
        bio: "",
        pfp: "",
        nickname: "",
        recentAnime: [],
        friends: [],
        friendProfiles: [],
        following: [],
        followingProfiles: [],
    });

    useEffect(() => {
        if (userId) {
            fetchRecentAnime();
            fetchUserProfile();
            fetchUserFriends();
            fetchFollowing();
        }
    }, [userId]);

    const fetchRecentAnime = async () => {
        try {
            const {data} = await api.get(`user/anime/recent/${userId}/`);
            setProfileData(prev => ({...prev, recentAnime: data}));
        } catch (error) {
            console.error("There was an error fetching the user's recent anime!", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const {data} = await api.get(`/user/profile/${userId}/`);
            setProfileData(prev => ({
                ...prev, bio: data.bio, pfp: data.profile_image, nickname: data.username
            }));
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };

    const fetchUserFriends = async () => {
        try {
            const {data} = await api.get(`/user/friends/${userId}/`);
            const friendProfiles = await Promise.all(data[0].friends.map(async (friend) => {
                const {data} = await api.get(`/user/profile/${friend.id}/`);
                return data;
            }));
            setProfileData(prev => ({
                ...prev, friends: data[0].friends.map(f => f.id), friendProfiles: friendProfiles
            }));
        } catch (error) {
            console.error("Error fetching friends", error);
        }
    };

    const fetchFollowing = async () => {
        try {
            const {data} = await api.get(`/user/following/${userId}/`);
            const following = data[0].following.map(f => f.id);
            const followingProfiles = await Promise.all(following.map(async (followId) => {
                const {data} = await api.get(`/user/profile/${followId}/`);
                return data;
            }));
            setProfileData(prev => ({
                ...prev, following: following, followingProfiles: followingProfiles
            }));
        } catch (error) {
            console.error("Error fetching following", error);
        }
    };

    const AddFriend = async () => {
        try {
            const {data} = await api.post(`/user/friends/add/${userId}/`);
            toast.success("Friend added successfully");
            console.log(data);
        } catch (error) {
            console.error("Error adding friend", error);
            toast.error("Error adding friend");
        }
    }

    const FollowUser = async () => {
        try {
            const {data} = await api.post(`/user/follow/${userId}/`);
            toast.success("User followed successfully");
            console.log(data);
        } catch (error) {
            console.error("Error following user", error);
            toast.error("Error following user");
        }
    }

    return (
        <div className="min-h-screen primary_bg text-gray-800">
            <header className="primary_border text-white py-4 shadow-lg text-center">
                <h2 className="font-bold text-3xl">Profile</h2>
            </header>
            <div className="flex flex-col md:flex-row w-full mx-auto gap-6 p-6">
                <div className="absolute top-4 gap-2 left-8 flex justify-evenly">
                    <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full transition-all" href="/home">Back</a>
                    <button className="bg-red-600 hover:bg-red-700 transition-all py-2 px-5 rounded-full text-sm font-semibold" onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}>Logout
                    </button>
                </div>
                <div className="primary_form_bg text-white rounded-lg shadow-lg p-6 md:w-1/2 max-h-fit">
                    <div className="flex flex-col items-center">
                        <img
                            src={profileData.pfp}
                            alt="profile"
                            className="rounded-full w-32 h-32 object-cover mb-4 shadow-lg"
                        />
                        <h2 className="font-bold text-2xl">
                            <span className="text-[#c1121f]">{profileData.nickname}</span>
                        </h2>
                        <p className="text-lg mt-4">
                            <span className="text-gray-600">{profileData.bio}</span>
                        </p>
                        <a
                            href={`/anime-list/${userId}`}
                            className="bg-[#780000] hover:bg-[#c1121f] text-white py-2 px-4 rounded-full mt-6 shadow-lg transition duration-300"
                        >
                            Anime List
                        </a>
                        <div className="flex mt-6 space-x-4">
                            <button
                                className="p-2 rounded font-semibold bg-violet-300 hover:bg-violet-400 transition"
                                onClick={() => FollowUser()}
                            >
                                Follow
                            </button>
                            <button
                                className="p-2 rounded font-semibold bg-violet-300 hover:bg-violet-400 transition"
                                onClick={() => AddFriend()}
                            >
                                Add Friend
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#669bbc] text-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4">Recently Added</p>
                    <ul className="space-y-4">
                        {profileData.recentAnime.map((anime) => (
                            <li key={anime.mal_id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={anime.image_url} alt={anime.title}
                                     className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-[#c1121f] hover:underline"
                                       href={`https://myanimelist.net/anime/${anime.mal_id}`} target="_blank"
                                       rel="noopener noreferrer">{anime.title}</a>
                                </div>
                            </li>))}
                    </ul>
                </div>
                <div className="bg-[#669bbc] text-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4">Friends</p>
                    <ul>
                        {profileData.friendProfiles.map((friend) => (
                            <li key={friend.id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={friend.profile_image} alt={friend.username}
                                     className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-[#c1121f] hover:underline"
                                       href={`/profile/${friend.user_id}`}>{friend.username}</a>
                                </div>
                            </li>))}
                    </ul>
                </div>
                <div className="bg-[#669bbc] text-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4">Following</p>
                    <ul>
                        {profileData.followingProfiles.map((follow) => (
                            <li key={follow.id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={follow.profile_image} alt={follow.username}
                                     className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-[#c1121f] hover:underline"
                                       href={`/profile/${follow.user_id}`}>{follow.username}</a>
                                </div>
                            </li>))}
                    </ul>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
}

export default ProfileAll;