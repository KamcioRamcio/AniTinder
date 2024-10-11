import api from "../../api.js";
import React, {useEffect, useRef, useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
    const [profileData, setProfileData] = useState({
        bio: '',
        pfp: '',
        nickname: '',
        recentAnime: [],
        friendRequests: [],
        requestProfiles: [],
        friends: [],
        friendProfiles: [],
        following: [],
        followingProfiles: []
    });
    const [allUsers, setAllUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const searchResultsRef = useRef(null);
    const id = localStorage.getItem('user_id');

    useEffect(() => {
        const fetchData = async () => {
            await fetchUserProfile();
            await fetchRecentAnime();
            await fetchAllUsers();
            await fetchFriendRequests();
            await fetchUserFriends();
            await fetchFollowing();
            filterSearchResults("");
        };
        fetchData();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchUserProfile = async () => {
        try {
            const {data} = await api.get(`/user/profile/${id}/`);
            setProfileData(prev => ({
                ...prev, bio: data.bio, pfp: data.profile_image, nickname: data.username
            }));
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };

    const fetchRecentAnime = async () => {
        try {
            const {data} = await api.get(`user/anime/recent/${id}/`);
            setProfileData(prev => ({...prev, recentAnime: data}));
        } catch (error) {
            console.error("Error fetching recent anime", error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const {data} = await api.get(`/all/users/`);
            setAllUsers(data.filter(user => user.user_id !== parseInt(id)));
        } catch (error) {
            console.error("Error fetching all users", error);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const {data} = await api.get(`/user/friends/requests/`);
            const uniqueRequests = data.filter((request, index, self) => index === self.findIndex((r) => r.id === request.id));

            const requestProfiles = await Promise.all(uniqueRequests.filter(request => request.is_active === true).map(async (request) => {
                if (request.sender === undefined) {
                    return null;
                } else {
                    const {data} = await api.get(`/user/profile/${request.sender}/`);
                    return {...data, request_id: request.id};
                }
            }));

            setProfileData(prev => ({...prev, requestProfiles: requestProfiles.filter(profile => profile !== null)}));
        } catch (error) {
            console.error("Error fetching friend requests", error);
        }
    };
    const fetchUserFriends = async () => {
        try {
            const {data} = await api.get(`/user/friends/${id}/`);
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
            const {data} = await api.get(`/user/following/${id}/`);
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

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };


    const filterSearchResults = (searchTerm) => {
        const filteredUsers = allUsers.filter(user => {
            const isFriend = profileData.friendProfiles.some(friend => friend.user_id === user.user_id);
            const isRequestPending = profileData.requestProfiles.some(request => request.user_id === user.user_id);
            return user.username.toLowerCase().includes(searchTerm) && !isFriend && !isRequestPending;
        });
        setSearchResults(filteredUsers);
    };

    const handleSearchChange = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        filterSearchResults(searchTerm);
    };


    const AddFriend = async (friendId) => {
        try {
            const response = await api.post(`/user/friends/add/${friendId}/`);
            if (response.status === 200) {
                console.log(response.data);
                toast("Friend request sent!", {type: "success"});
            } else {
                console.log("Error adding friend");
                toast("You already send a request", {type: "error"});
            }
        } catch (error) {
            console.error("There was an error adding the friend!", error);
            toast("You already send a request", {type: "error"});
        }
    };
    const Unfriend = async (friendId) => {
        try {
            const response = await api.post(`/user/friends/unfriend/${friendId}/`);
            if (response.status === 200) {
                console.log(response.data);
                toast("Unfriended", {type: "success"});
                fetchUserFriends();
            } else {
                console.log("Error unfriending user");
                toast("Error unfriending user", {type: "error"});
            }
        } catch (error) {
            console.error("There was an error unfriending the user!", error.response ? error.response.data : error);
            toast("Error unfriending user", {type: "error"});
        }
    };

    const Follow = async (followId) => {
        try {
            const response = await api.post(`/user/follow/${followId}/`);
            if (response.status === 200) {
                console.log(response.data); // Log the success message from the server
                fetchFollowing(); // Call a function to refresh the user's following list
            } else {
                console.log("You are already following this user");
                toast("You are already following this user", {type: "error"});
            }
        } catch (error) {
            console.error("There was an error following the user!", error.response ? error.response.data : error);
            toast("You are already following this user", {type: "error"});
        }
    }

    const Unfollow = async (followId) => {
        try {
            const response = await api.post(`/user/unfollow/${followId}/`);
            if (response.status === 200) {
                console.log(response.data);
                toast("Bye bye ", {type: "success"});
                fetchFollowing(); // Call a function to refresh the user's following list
            } else {
                console.log("Error unfollowing user");
                toast("Error unfollowing user", {type: "error"});
            }
        } catch (error) {
            console.error("There was an error unfollowing the user!", error.response ? error.response.data : error);
            toast("Error unfollowing user", {type: "error"});
        }
    }


    const AcceptFriend = async (request_id) => {
        console.log("Request ID being sent:", request_id);
        try {
            const response = await api.post(`/user/friend-request/accept/`, {request_id: request_id});
            if (response.status === 200) {
                console.log(response.data);
                toast("Friend request accepted!", {type: "success"});
                fetchFriendRequests();
                fetchUserFriends();
            } else {
                console.log("Error accepting friend");
                toast("Error accepting friend", {type: "error"});
            }
        } catch (error) {
            console.error("There was an error accepting the friend!", error);
            toast("Error accepting friend", {type: "error"});
        }
    };

    const DenyFriend = async (request_id) => {
        console.log("Request ID being sent:", request_id);
        try {
            const response = await api.post(`/user/friend-request/deny/`, {request_id: request_id});
            if (response.status === 200) {
                console.log(response.data);
                toast("Friend request denied!", {type: "success"});
                fetchFriendRequests();
            } else {
                console.log("Error denying friend");
                toast("Error denying friend", {type: "error"});
            }
        } catch (error) {
            console.error("There was an error denying the friend!", error);
            toast("Error denying friend", {type: "error"});
        }
    }

    return (
        <div className="min-h-screen primary_bg text-gray-800">
            <header className="primary_border text-white py-4 shadow-lg text-center">
                <h2 className="font-bold text-3xl">Profile</h2>
            </header>

            <div className="flex flex-col md:flex-row w-full mx-auto gap-6 p-6">
                <div className="absolute top-4 left-8 space-x-2 ">
                    <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full transition-all"
                       href="/home">Back</a>
                    <button
                        className="bg-red-600 hover:bg-red-700 transition-all py-2 px-5 rounded-full text-sm font-semibold"
                        onClick={handleLogout}>Logout
                    </button>
                </div>

                <div className="absolute top-2 right-8 w-1/3 md:w-1/4">
                    <input
                        type="text"
                        placeholder="Search Users..."
                        onChange={handleSearchChange}
                        className="w-full p-3 rounded-lg shadow-md border-2 border-[#669bbc]  focus:outline-none focus:border-indigo-800 placeholder-gray-500 text-gray-800"
                    />
                </div>

                {searchResults.length > 0 && (
                    <div ref={searchResultsRef}
                         className="absolute top-16 right-8 w-1/3 md:w-1/4 bg-white rounded-lg shadow-lg p-6">
                        <ul>
                            {searchResults.map((user) => (
                                <li key={user.user_id}
                                    className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                    <img src={user.profile_image} alt={user.username}
                                         className="h-24 w-20 rounded-lg shadow-md"/>
                                    <div>
                                        <a className="text-lg font-semibold text-indigo-600 hover:underline"
                                           href={`/profile/${user.user_id}`}>
                                            {user.username}
                                        </a>
                                    </div>
                                    <button className="p-2 bg-green-500 rounded" ref={searchResultsRef}
                                            onClick={() => AddFriend(user.user_id)}>Add
                                    </button>
                                    <button className="p-2 bg-violet-700 rounded" ref={searchResultsRef}
                                            onClick={() => Follow(user.user_id)}>Follow
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="primary_form_bg text-white rounded-lg shadow-lg p-6 md:w-1/2 max-h-fit">
                    <div className="flex flex-col items-center">
                        <img src={profileData.pfp} alt="profile"
                             className="rounded-full w-32 h-32 object-cover mb-4 shadow-lg"/>
                        <h2 className="font-bold text-2xl"><span
                            className="text-[#c1121f]">{profileData.nickname}</span></h2>
                        <p className="text-lg mt-4"><span className="text-gray-600">{profileData.bio}</span></p>
                        <a href="/profile-edit"
                           className="bg-[#780000] hover:bg-[#c1121f] text-white py-2 px-4 rounded-full mt-6 shadow-lg transition duration-300">Edit
                            Profile</a>
                        <a href="/animelist"
                           className="bg-[#780000] hover:bg-[#c1121f] text-white py-2 px-4 rounded-full mt-6 shadow-lg transition duration-300">Anime
                            List</a>
                    </div>
                </div>

                <div className="bg-[#669bbc] text-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4">Recently Added</p>
                    <ul className="space-y-4">
                        {profileData.recentAnime.map(anime => (
                            <li key={anime.mal_id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={anime.image_url} alt={anime.title}
                                     className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-[#c1121f] hover:underline"
                                       href={`https://myanimelist.net/anime/${anime.mal_id}`} target="_blank"
                                       rel="noopener noreferrer">
                                        {anime.title}
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#669bbc] text-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4">Following</p>
                    <ul>
                        {profileData.followingProfiles.map(follow => (
                            <li key={follow.id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={follow.profile_image} alt={follow.username}
                                     className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-[#c1121f] hover:underline"
                                       href={`/profile/${follow.user_id}`}>
                                        {follow.username}
                                    </a>
                                </div>
                                <button className="p-2 bg-red-500 rounded"
                                        onClick={() => Unfollow(follow.user_id)}>Unfollow
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#669bbc] text-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4">Friends</p>
                    <ul>
                        {profileData.friendProfiles.map(friend => (
                            <li key={friend.id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={friend.profile_image} alt={friend.username}
                                     className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-[#c1121f] hover:underline"
                                       href={`/profile/${friend.user_id}`}>
                                        {friend.username}
                                    </a>
                                </div>
                                <button className="p-2 bg-red-500 rounded"
                                        onClick={() => Unfriend(friend.user_id)}>Unfriend
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#669bbc] text-white rounded-lg shadow-lg p-6 md:w-1/2">
                    <p className="text-center font-bold text-xl mb-4">Friend Requests</p>
                    <ul>
                        {profileData.requestProfiles.map(reqProfile => (
                            <li key={reqProfile.id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                <img src={reqProfile.profile_image} alt={reqProfile.username}
                                     className="h-24 w-20 rounded-lg shadow-md"/>
                                <div>
                                    <a className="text-lg font-semibold text-[#c1121f] hover:underline"
                                       href={`/profile/${reqProfile.user_id}`}>
                                        {reqProfile.username}
                                    </a>
                                </div>
                                <button className="p-2 bg-green-500 rounded"
                                        onClick={() => AcceptFriend(reqProfile.request_id)}>Accept
                                </button>
                                <button className="p-2 bg-red-500 rounded"
                                        onClick={() => DenyFriend(reqProfile.request_id)}>Deny
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
}

export default Profile;