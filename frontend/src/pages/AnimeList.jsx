import React, {useEffect, useState} from "react";
import api from "../api";
import Swal from 'sweetalert2';
import {ToastContainer} from "react-toastify";

function AnimeList() {
    const [animes, setAnimes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAnimes, setFilteredAnimes] = useState([]);
    const [tmpDeleteAnime, setTmpDeleteAnime] = useState([]);
    const [showTmpDeleteAnime, setShowTmpDeleteAnime] = useState(false);
    const [showAnimeList, setShowAnimeList] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [userAnimeList, setUserAnimeList] = useState([]);
    const [showUserAnimeList, setShowUserAnimeList] = useState(false);
    const [showUserPlanToWatchList, setShowUserPlanToWatchList] = useState(false);

    useEffect(() => {
        fetchAllAnime();
        fetchUserAnimeList();
        fetchUserTmpDeleteAnime();
    }, []);

    const handleSearchChange = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchTerm(searchTerm);
        const userAnimeIds = userAnimeList.map(anime => anime.mal_id);
        const filtered = animes.filter(anime =>
            anime.title.toLowerCase().includes(searchTerm) && !userAnimeIds.includes(anime.mal_id)
        );
        setFilteredAnimes(filtered);
        setShowSearchResults(searchTerm.length > 0);
    };

    const fetchAllAnime = () => {
        api.get("anime/all/")
            .then(response => {
                if (Array.isArray(response.data)) {
                    setAnimes(response.data);
                    setFilteredAnimes(response.data);
                } else {
                    console.error("Response data is not an array:", response.data);
                }
            })
            .catch(error => {
                console.error("There was an error fetching the titles!", error);
            });
    };

    const fetchUserAnimeList = async () => {
        try {
            const response = await api.get("user/anime/");
            if (Array.isArray(response.data)) {
                setUserAnimeList(response.data);
                console.log("User anime list:", response.data);
            } else {
                console.error("Response data is not an array:", response.data);
            }
        } catch (error) {
            console.error("There was an error fetching the user anime list!", error);
        }
    };

    const fetchUserTmpDeleteAnime = async () => {
        try {
            const response = await api.get("user/anime/temp-deleted/");
            if (Array.isArray(response.data)) {
                setTmpDeleteAnime(response.data);
                console.log(response.data);
            } else {
                console.error("Response data is not an array:", response.data);
            }
        } catch (error) {
            console.error("There was an error fetching the user anime list!", error);
        }
    }

    const handleAddAnime = async (anime, watched) => {
        if (userAnimeList.some(item => item.mal_id === anime.mal_id)) {
            Swal.fire({
                title: "Anime already exists in your list.",
                icon: "error",
                timer: 500,
                showConfirmButton: false
            });
            return;
        }
        try {
            const response = await api.post("user/anime/", {
                title: anime.title,
                image_url: anime.image_url,
                mal_id: anime.mal_id,
                watched: watched,
                plan_to_watch: !watched
            });
            if (response.status === 201) {
                Swal.fire({
                    title: "Anime added successfully",
                    icon: "success",
                    timer: 500,
                    showConfirmButton: false
                });
                fetchUserAnimeList();
            } else {
                Swal.fire({
                    title: "Failed to add anime",
                    icon: "error",
                    timer: 500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("Error adding anime:", error);
            Swal.fire({
                title: "Error adding anime",
                icon: "error",
                timer: 500,
                showConfirmButton: false
            });
        } finally {
            setShowSearchResults(false);
            setSearchTerm("");
        }
    };

    const handleWatchChange = async (anime, watched) => {
        try {
            const response = await api.put(`user/anime/update/${anime.mal_id}/`, {
                watched: watched,
                plan_to_watch: !watched
            });

            if (response.status === 200) {
                Swal.fire({
                    title: "Anime status updated successfully",
                    icon: "success",
                    timer: 500,
                    showConfirmButton: false
                });
                fetchUserAnimeList();
            } else {
                Swal.fire({
                    title: "Failed to change anime status",
                    icon: "error",
                    timer: 500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("Error updating anime status:", error);
            Swal.fire({
                title: "Failed to change anime status",
                icon: "error",
                timer: 500,
                showConfirmButton: false
            });
        }
    };

    const handleAnimeClick = async (anime) => {
        if (userAnimeList.some(item => item.mal_id === anime.mal_id)) {
            Swal.fire({
                title: "Anime in your list",
                icon: "error",
                timer: 500,
                showConfirmButton: false
            });
            return;
        }

        const status = await showPopupAdd();

        if (status) {
            await handleAddAnime(anime, status);
            Swal.fire({
                title: `Added to watched!`,
                icon: "success",
                timer: 500,
                showConfirmButton: false
            });
        } else {
            await handleAddAnime(anime, status);
            Swal.fire({
                title: `Added to plan to watch!`,
                icon: "success",
                timer: 500,
                showConfirmButton: false
            });
        }
    };

    const handleDeleteClick = async (anime) => {
    const status = await showPopupChange(anime.watched);
    if (status) {
        await handleWatchChange(anime, !anime.watched);
        Swal.fire({
            title: `Moved successfully!`,
            icon: "success",
            timer: 500,
            showConfirmButton: false
        });
    } else if (status === false) {
        await handleDeleteAnime(anime.id);
        Swal.fire({
            title: `Anime deleted!`,
            icon: "success",
            timer: 500,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            title: `Cancelled!`,
            icon: "info",
            timer: 500,
            showConfirmButton: false
        });
    }
};

    const handleDeleteAnime = async (animeId) => {
        try {
            const response = await api.delete(`user/anime/delete/${animeId}/`);
            if (response.status === 204) {
                fetchUserAnimeList();
            } else {
                Swal.fire({
                    title: "Failed to delete anime",
                    icon: "error",
                    timer: 500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("Error deleting anime:", error);
            Swal.fire({
                title: "Failed to delete anime",
                icon: "error",
                timer: 500,
                showConfirmButton: false
            });
        } finally {
            setShowSearchResults(false);
            setSearchTerm("");
        }
    };

    const handleDeleteTmpAnime = async (anime) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${anime.title} from temporary deleted list?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`user/anime/temp-deleted/${anime.id}/`);
                if (response.status === 204) {
                    fetchUserTmpDeleteAnime();
                } else {
                    Swal.fire({
                        title: "Failed to delete anime",
                        icon: "error",
                        timer: 500,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                console.error("Error deleting anime:", error);
                Swal.fire({
                    title: "Failed to delete anime",
                    icon: "error",
                    timer: 500,
                    showConfirmButton: false
                });
            }
        } else {
            Swal.fire({
                title: "Cancelled",
                icon: "info",
                timer: 500,
                showConfirmButton: false
            });
        }
    };

     const handleDeleteAllTmpAnime = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete all temporarily deleted anime?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete all!',
            cancelButtonText: 'No, keep them'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`user/anime/temp-deleted/delete-all/${localStorage.getItem("user_id")}/`);
                if (response.status === 204) {
                    fetchUserTmpDeleteAnime();
                    Swal.fire({
                        title: "All temporarily deleted anime removed",
                        icon: "success",
                        timer: 500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        title: "Failed to delete all temporarily deleted anime",
                        icon: "error",
                        timer: 500,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                console.error("Error deleting all temporarily deleted anime:", error);
                Swal.fire({
                    title: "Failed to delete all temporarily deleted anime",
                    icon: "error",
                    timer: 500,
                    showConfirmButton: false
                });
            }
        } else {
            Swal.fire({
                title: "Cancelled",
                icon: "info",
                timer: 500,
                showConfirmButton: false
            });
        }
    };

    const showPopupAdd = () => {
        return Swal.fire({
            title: 'Add to :',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Watched',
            denyButtonText: 'Plan to watch',
        }).then((result) => {
            if (result.isConfirmed) {
                return true;
            } else if (result.isDenied) {
                return false;
            } else {
                return null;
            }
        });
    };

    const showPopupChange = (currentStatus) => {
    const newStatus = currentStatus ? 'plan to watch' : 'watched';
    return Swal.fire({
        title: 'Change status to:',
        showDenyButton: true,
        confirmButtonText: `Move to ${newStatus}`,
        denyButtonText: 'Delete',
    }).then((result) => {
        if (result.isConfirmed) {
            return true;
        } else if (result.isDenied) {
            return false;
        } else {
            return null;
        }
    });
};

    return (
        <div className="min-h-screen bg-[#fdf0d5] pt-20">
            <a className="bg-slate-800 text-white m-4 p-2 rounded mb-4 absolute top-0 hover:bg-[#780000]"
               href="/home">Back</a>
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold text-center mb-8 text-[#780000]">Anime List</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search anime..."
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {showSearchResults && (
                    <ul className="bg-white border border-gray-300 rounded mt-2 p-2">
                        {filteredAnimes.map((anime) => (
                            <li key={anime.mal_id} className="p-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleAnimeClick(anime)}>
                                {anime.title}
                            </li>
                        ))}
                    </ul>
                )}

                <button className="bg-slate-800 text-white p-2 rounded m-2 hover:bg-[#780000]"
                        onClick={() => setShowAnimeList(!showAnimeList)}>
                    {showAnimeList ? "HIDE ANIME" : "SHOW ALL ANIME"}
                </button>

                {showAnimeList && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-4">
                        {filteredAnimes.map((anime) => (
                            <li key={anime.mal_id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:bg-gray-200 cursor-pointer p-2"
                                onClick={() => handleAnimeClick(anime)}>
                                <img src={anime.image_url} alt={anime.title} className="w-full h-48 object-cover"/>
                                <div className="p-4">
                                    <p className="text-lg font-semibold">{anime.title}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <button
                    className="bg-slate-800 text-white p-2 rounded m-2 hover:bg-[#780000]"
                    onClick={() => setShowTmpDeleteAnime(!showTmpDeleteAnime)}>
                    {showTmpDeleteAnime ? "HIDE DELETED ANIME" : "SHOW DELETED ANIME"}
                </button>
                {showTmpDeleteAnime && tmpDeleteAnime.length > 0 && (
                    <div className="flex justify-start flex-col">
                        <h2 className="text-2xl font-bold mb-4">Deleted Anime List</h2>
                        <button
                        className="bg-slate-800 text-white p-2 rounded m-2 hover:bg-[#780000] w-1/4"
                        onClick={handleDeleteAllTmpAnime}
                        >Clear all temporary deleted anime</button>
                        <ul className="flex flex-wrap gap-4">
                            {tmpDeleteAnime.map((anime) => (
                                <li key={anime.mal_id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => handleDeleteTmpAnime(anime)}>
                                    <p className="text-lg font-semibold">{anime.title}</p>
                                    <img src={anime.image_url} alt={anime.title}/>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button className="bg-slate-800 text-white p-2 rounded m-2 hover:bg-[#780000]"
                        onClick={() => setShowUserAnimeList(!showUserAnimeList)}>
                    {showUserAnimeList ? "HIDE ANIME" : "SHOW YOUR ANIME"}
                </button>
                {showUserAnimeList && userAnimeList.length > 0 && (
                    <div className="flex justify-start flex-col">
                        <h2 className="text-2xl font-bold mb-4">Your Watched Anime List</h2>
                        <ul className="flex flex-wrap gap-4">
                            {userAnimeList.filter(anime => anime.watched).map((anime) => (
                                <li key={anime.mal_id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => handleDeleteClick(anime)}>
                                    <p className="text-lg font-semibold">{anime.title}</p>
                                    <img src={anime.image_url} alt={anime.title}
                                         className="w-full h-48 object-cover mt-2"/>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <button className="bg-slate-800 text-white p-2 rounded m-2 hover:bg-[#780000]"
                        onClick={() => setShowUserPlanToWatchList(!showUserPlanToWatchList)}>
                    {showUserPlanToWatchList ? "HIDE ANIME" : "SHOW YOUR PLAN TO WATCH LIST"}
                </button>
                {showUserPlanToWatchList && userAnimeList.length > 0 && (
                    <div className="flex justify-start flex-col">
                        <h2 className="text-2xl font-bold mb-4">Your Plan to Watch List</h2>
                        <ul className="flex flex-wrap gap-4">
                            {userAnimeList.filter(anime => anime.plan_to_watch).map((anime) => (
                                <li key={anime.mal_id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => handleDeleteClick(anime)}>
                                    <p className="text-lg font-semibold">{anime.title}</p>
                                    <img src={anime.image_url} alt={anime.title}
                                         className="w-full h-48 object-cover mt-2"/>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <ToastContainer/>
        </div>
    );
}

export default AnimeList;