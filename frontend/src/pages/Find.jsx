import React, {useEffect, useState} from "react";
import {FaCog} from "react-icons/fa";
import api from "../api";
import Swal from 'sweetalert2';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {genres as allGenres} from '../constants';

function Find() {
    const [showBox, setShowBox] = useState(false);
    const username = localStorage.getItem('username');
    const [anime, setAnime] = useState([]);
    const [randomAnime, setRandomAnime] = useState(null);
    const [showSynopsis, setShowSynopsis] = useState(false);
    const [filteredAnime, setFilteredAnime] = useState([]);
    const [userGenres, setUserGenres] = useState([]);
    const [selectedScore, setSelectedScore] = useState(3);
    const [userAnime, setUserAnime] = useState([]);
    const [tempDeletedAnime, setTempDeletedAnime] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const id = localStorage.getItem('user_id');
    const [profileData, setProfileData] = useState({
        pfp: '',
        nickname: '',
    });

    useEffect(() => {
        fetchUserAnimeList();
    }, []);

    useEffect(() => {
        fetchAnime();
        fetchUserProfile();
        fetchTempDeletedAnime();
        fetchQuotes();
    }, []);


    useEffect(() => {
        filterAnime(anime, selectedScore, userGenres);
    }, [anime, userGenres, selectedScore, tempDeletedAnime]);

    const fetchAnime = async () => {
        try {
            const response = await api.get("anime/all/");
            if (Array.isArray(response.data)) {
                setAnime(response.data);
                getRandomAnime(response.data);
                filterAnime(response.data, selectedScore, userGenres);
            } else {
                console.error("Response data is not an array:", response.data);
            }
        } catch (error) {
            console.error("There was an error fetching the anime!", error);
        }
    };


    const fetchUserAnimeList = async () => {
        try {
            const response = await api.get("user/anime/");
            if (Array.isArray(response.data)) {
                setUserAnime(response.data);
                localStorage.setItem('user_id', response.data[0].author);

            } else {
                console.error("Response data is not an array:", response.data);
            }
        } catch (error) {
            console.error("There was an error fetching the anime!", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const {data} = await api.get(`/user/profile/${id}/`);
            setProfileData(prev => ({
                ...prev, pfp: data.profile_image, nickname: data.username
            }));
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };
    const fetchTempDeletedAnime = async () => {
        try {
            const response = await api.get("user/anime/temp-deleted/");
            if (Array.isArray(response.data)) {
                setTempDeletedAnime(response.data);
            } else {
                console.error("Response data is not an array:", response.data);
            }
        } catch (error) {
            console.error("There was an error fetching the anime!", error);
        }
    };

    const fetchQuotes = async () => {
        try {
            const response = await api.get("anime/quotes/");
            if (Array.isArray(response.data)) {
                setQuotes(getRandomQuotes(response.data));
            } else {
                console.error("Response data is not an array:", response.data);
            }
        } catch (error) {
            console.error("There was an error fetching the quotes!", error);
        }
    };

    const getRandomQuotes = (quotesList) => {
        return quotesList.sort(() => 0.5 - Math.random()).slice(0, 4);
    };

    const handleTempDeleteAnime = async (anime) => {
        try {
            const response = await api.post("user/anime/temp-deleted/", {
                title: anime.title,
                mal_id: anime.mal_id,
                image_url: anime.image_url,
            });
            if (response.status === 201) {
                toast.success('Anime deleted successfully');
                fetchTempDeletedAnime();
            } else {
                toast.error('Failed to delete anime');
            }
        } catch (error) {
            console.error("Error deleting anime:", error);
        } finally {
            getRandomAnime(filteredAnime);
        }
    };

    const getRandomAnime = (animeList) => {
        if (animeList.length === 0) {
            setRandomAnime(null);
            return;
        }
        setRandomAnime(animeList[Math.floor(Math.random() * animeList.length)]);
    };

    const filterAnime = (animeList, score, genres) => {
        const filtered = animeList.filter((a) => {
            const notTempDeleted = !tempDeletedAnime.some((tda) => tda.mal_id === a.mal_id);
            const notUserAnime = !userAnime.some((ua) => ua.mal_id === a.mal_id);
            const meetsScore = a.score >= score;
            const meetsGenres = genres.length > 0 ? a.genres.some((g) => genres.includes(g.name)) : true;
            return meetsScore && meetsGenres && notUserAnime && notTempDeleted;
        });
        setFilteredAnime(filtered);
        getRandomAnime(filtered);
    };

    const toggleBox = () => setShowBox(!showBox);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleAddAnimeClick = async (anime) => {
        const status = await showPopup();
        if (status !== null) {
            await handleAddAnime(anime, status);
            Swal.fire(`Added to ${status ? 'watched' : 'plan to watch'}!`, '', 'success');
        } else {
            Swal.fire('Cancelled!', '', 'info');
        }
    };

    const showPopup = () => {
        return Swal.fire({
            title: 'Add to :',
            showDenyButton: true,
            confirmButtonText: 'Watched',
            denyButtonText: 'Plan to watch',
        }).then((result) => result.isConfirmed ? true : result.isDenied ? false : null);
    };

    const handleAddAnime = async (anime, watchStatus) => {
        if (userAnime.some(item => item.mal_id === anime.mal_id)) {
            Swal.fire('Anime already exists in your list.', '', 'error');
            return;
        }
        try {
            const response = await api.post("user/anime/", {
                title: anime.title,
                username: username,
                image_url: anime.image_url,
                mal_id: anime.mal_id,
                watched: watchStatus,
                plan_to_watch: !watchStatus
            });
            if (response.status === 201) {
                Swal.fire('Anime added successfully', '', 'success');
                fetchUserAnimeList();
            } else {
                Swal.fire('Failed to add anime', '', 'error');
            }
            filterAnime(anime, selectedScore, userGenres);
        } catch (error) {
            console.error("Error adding anime:", error);
            Swal.fire('Error adding anime', '', 'error');
        } finally {
            getRandomAnime(filteredAnime);
        }
    };

    const handleTrailer = () => {
        if (randomAnime?.trailer_url) {
            window.open(randomAnime.trailer_url);
        } else {
            Swal.fire('No trailer available', '', 'error');
        }
    };

    return (
        <div className="bg-[#fdf0d5] suse-font min-h-screen">
            {/* Header */}
            <header className="bg-[#780000] text-white py-4 shadow-lg">
                <div className="container mx-auto flex items-center">
                    <h1 className="text-4xl font-bold tracking-wide">AniTinder</h1>
                    <div className="ml-auto flex items-center space-x-4">
                        <a href="/animelist"
                           className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full transition-all">
                            Anime List
                        </a>
                        <a href="/profile"
                           className="bg-green-600 hover:bg-blue-600 text-white py-2 px-6 rounded-full transition-all">
                            Profile
                        </a>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 transition-all py-2 px-5 rounded-full text-sm font-semibold"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Box */}
                <div className="bg-[#669bbc] p-6 rounded-xl shadow-lg relative max-h-72">
                    <button
                        className="bg-gray-200 p-3 rounded-full shadow-md absolute top-4 right-4 hover:scale-110 transform transition-all"
                        onClick={toggleBox}
                    >
                        <FaCog className="text-2xl text-[#c1121f]"/>
                    </button>
                    <img
                        src={profileData.pfp}
                        alt="Anime"
                        className="w-40 h-40 rounded-full mb-4 mx-auto shadow-lg"
                    />
                    <p className="text-center font-semibold text-xl mb-2">Welcome, {username}</p>
                    {showBox && (
                        <div className="bg-[#fdf0d5] p-6 rounded-lg shadow-lg mt-6">
                            <p className="font-bold text-lg mb-4">User Preferences</p>
                            {/* Filter by Genres */}
                            <div className="text-left">
                                <p className="font-semibold text-sm mb-2">Filter by genres:</p>
                                {allGenres.map((g, index) => (
                                    <label key={index} className="block mb-1">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={userGenres.includes(g)}
                                            onChange={() => {
                                                const updatedGenres = userGenres.includes(g)
                                                    ? userGenres.filter((gen) => gen !== g)
                                                    : [...userGenres, g];
                                                setUserGenres(updatedGenres);
                                            }}
                                        />
                                        {g}
                                    </label>
                                ))}
                            </div>
                            {/* Filter by Score */}
                            <div className="mt-4">
                                <label htmlFor="score" className="font-semibold text-sm">
                                    Filter by score:
                                </label>
                                <select
                                    name="score"
                                    id="score"
                                    value={selectedScore}
                                    className="ml-2 bg-[#fdf0d5] shadow-md rounded-lg border-none px-3 py-2"
                                    onChange={(e) => setSelectedScore(parseInt(e.target.value))}
                                >
                                    {[...Array(6).keys()].map(i => (
                                        <option key={i} value={i + 3}>
                                            {i + 3}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Anime Display */}
                <div className=" min-h-screen ml-12 mr-12">
                    {randomAnime ? (
                        <div className="max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
                            <img src={randomAnime.image_url} alt={randomAnime.title} className="w-full"/>
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold mb-3">{randomAnime.title}</h2>
                                <p className="text-gray-700 mb-4">
                                    {randomAnime.genres.map(g => g.name).join(", ")} | Score: {randomAnime.score} |
                                    Episodes: {randomAnime.episodes} | Year: {randomAnime.year}
                                </p>
                                {showSynopsis && <p className="text-gray-800 mb-4">{randomAnime.synopsis}</p>}
                                <button
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all"
                                    onClick={() => setShowSynopsis(!showSynopsis)}
                                >
                                    {showSynopsis ? "Hide Synopsis" : "Show Synopsis"}
                                </button>
                                <div className="flex space-x-4 mt-6">
                                    <button
                                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
                                        onClick={() => handleTempDeleteAnime(randomAnime)}
                                    >
                                        Skip
                                    </button>
                                    <button
                                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
                                        onClick={() => handleAddAnimeClick(randomAnime)}
                                    >
                                        Like
                                    </button>
                                    <button
                                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all"
                                        onClick={handleTrailer}
                                    >
                                        Trailer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-lg font-semibold">No more anime to show. Please adjust your filters.</p>
                            <img alt=""
                                 src="https://s9.tvp.pl/images2/9/9/9/uid_9993b5abff84f08a8d1f6a1a583b60ed1608719985432_width_900_play_0_pos_0_gs_0_height_506.jpg"/>
                        </div>
                    )}
                </div>

                {/* Quotes Section */}
                <div className="bg-[#669bbc] p-6 rounded-xl shadow-lg ">
                    <p className="font-semibold text-lg text-center">Quotes</p>
                    <div className="mt-4 space-y-4">
                        {quotes.map((quote, index) => (
                            <div key={index} className="bg-[#fdf0d5] p-4 rounded-lg shadow-md">
                                <p className="text-[#c1121f] font-bold">{quote.character}</p>
                                <p className="text-gray-600 italic">{quote.quote}</p>
                                <p className="text-[#c1121f] font-bold">Anime: {quote.anime}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
}

export default Find;