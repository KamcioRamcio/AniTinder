import React, {useEffect, useState} from "react";
import api from "../api";
import {useParams} from 'react-router-dom';
import {ToastContainer} from "react-toastify";

function AnimeListAll() {
    const [userAnimeList, setUserAnimeList] = useState([]);
    const {userId} = useParams();
    const [ProfileData, setProfileData] = useState({
        bio: "",
        pfp: "",
        nickname: "",
        is_public: false,
        user_id: userId,
    });

    useEffect(() => {
        fetchUserAnimeList();
        fetchUserProfile()
    }, []);

    const fetchUserAnimeList = async () => {
        try {
            const response = await api.get(`user/anime-list/${userId}/`);
            if (Array.isArray(response.data)) {
                setUserAnimeList(response.data);
            } else {
                console.error("Response data is not an array:", response.data);
            }
        } catch (error) {
            console.error("There was an error fetching the user anime list!", error);
        }
    };
    const fetchUserProfile = async () => {
        try {
            const {data} = await api.get(`/user/profile/${userId}/`);
            setProfileData(prev => ({
                ...prev,
                bio: data.bio,
                pfp: data.profile_image,
                nickname: data.username,
                is_public: data.anime_list_public,
            }));

        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    }
    if (!ProfileData.is_public) {
        return (
            <div className="min-h-screen bg-[#fdf0d5] flex items-center justify-center">
                <a className="bg-slate-800 text-white m-4 p-2 rounded mb-4 absolute top-0 left-0 hover:bg-[#780000]"
                   href="/home">Back</a>
                <div className="container mx-auto text-center">
                    <div className="flex justify-center text-black">
                        <img src={ProfileData.pfp} alt="Profile Picture" className="w-32 h-32 rounded-full"/>
                    </div>
                    <a className="text-4xl font-bold text-center mt-4"
                       href={`/profile/${ProfileData.user_id}`}>{ProfileData.nickname}</a>
                    <p className="text-lg text-center mt-2">{ProfileData.bio}</p>
                    <p className="text-lg text-center mt-2 font-bold">This user's anime list is private.</p>
                    <div className="flex items-center justify-center mt-4">
                        <iframe
                            src="https://giphy.com/embed/AOitRwIgx2wcOxZaIH"
                            width="480"
                            height="480"
                            allowFullScreen
                            style={{pointerEvents: 'none'}}
                        ></iframe>
                    </div>
                </div>
            </div>
        );
    } else {

        return (
            <div className="min-h-screen bg-[#fdf0d5] pt-20">
                <a className="bg-slate-800 text-white m-4 p-2 rounded mb-4 absolute top-0 hover:bg-[#780000]"
                   href="/home">Back</a>
                <div className="container mx-auto p-4">
                    <div>
                        <div className="flex justify-center text-black">
                            <img src={ProfileData.pfp} alt="Profile Picture" className="w-32 h-32 rounded-full"/>
                        </div>
                        <a className="text-4xl font-bold text-center mt-4"
                           href={`/profile/${ProfileData.user_id}`}>{ProfileData.nickname}</a>
                        <p className="text-lg text-center mt-2">{ProfileData.bio}</p>
                    </div>
                    <div className="flex justify-start flex-col mb-8">
                        <h2 className="text-2xl font-bold mb-4">Watched Anime </h2>
                        <ul className="flex flex-wrap gap-4">
                            {userAnimeList.filter(anime => anime.watched).map((anime) => (
                                <li key={anime.mal_id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden p-2 hover:bg-gray-200 cursor-pointer">
                                    <p className="text-lg font-semibold">{anime.title}</p>
                                    <img src={anime.image_url} alt={anime.title}
                                         className="w-full h-48 object-cover mt-2"/>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-start flex-col">
                        <h2 className="text-2xl font-bold mb-4">Plan to Watch </h2>
                        <ul className="flex flex-wrap gap-4">
                            {userAnimeList.filter(anime => anime.plan_to_watch).map((anime) => (
                                <li key={anime.mal_id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden p-2 hover:bg-gray-200 cursor-pointer">
                                    <p className="text-lg font-semibold">{anime.title}</p>
                                    <img src={anime.image_url} alt={anime.title}
                                         className="w-full h-48 object-cover mt-2"/>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        );
    }
}

export default AnimeListAll;