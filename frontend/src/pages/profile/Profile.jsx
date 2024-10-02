import api from "../../api.js";
import React, {useEffect, useState} from "react";

/* TODO
    - Create a Profile page that displays the user's information
    - Add add_time to user_anime_list to allow to show recently added anime
    - Add a button to edit user information
    - Add user friends and follow list

* */

function Profile() {
    const username = localStorage.getItem('username');
    const pfp = localStorage.getItem('profile_image');
    const bio  = localStorage.getItem('bio');
    const [recentAnime, setRecentAnime] = React.useState([]);

    useEffect(() => {
        fetchRecentAnime();
    }, []);

    const fetchRecentAnime = async () => {
        const response = await api.get(`user/anime/recent/${username}/`);
        try {
            if (response.status === 200) {
                console.log(response.data);
                setRecentAnime(response.data);
            } else {
                console.log("Error fetching recent anime");
            }
        } catch (error) {
            console.error("There was an error fetching the profile!", error);
        }
    };

        const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

return (
  <div className="min-h-screen bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
    <header className="text-center py-6">
      <h2 className="font-bold text-3xl">Profile</h2>
    </header>
    <div className="flex flex-col md:flex-row w-full  mx-auto gap-6 p-6">
        {/*Back*/}
        <div className="absolute top-8 left-8 flex justify-evenly">
            <a className="bg-green-500 p-2 rounded" href="/home">Back</a>
            <button className="bg-red-500 p-2 rounded mx-4" onClick={handleLogout}>Logout</button>
        </div>

        {/* Search Bar in the Right Corner */}
      <div className="absolute top-8 right-8 w-1/3 md:w-1/4">
        <input
          type="text"
          placeholder="Search Users..."
          className="w-full p-3 rounded-lg shadow-md border-2 border-indigo-600 focus:outline-none focus:border-indigo-800 placeholder-gray-500 text-gray-800"
        />
      </div>

      {/* Profile Information Section */}
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6 md:w-1/2 max-h-fit">
        <div className="flex flex-col items-center">
          <img src={pfp} alt="profile" className="rounded-full w-32 h-32 object-cover mb-4 shadow-lg" />
          <h2 className="font-bold text-2xl"><span className="text-indigo-600">{username}</span></h2>
          <p className="text-lg mt-4"><span className="text-gray-600">{bio}</span></p>
          <a href="/profile-edit" className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-full mt-6 shadow-lg transition duration-300">
            Edit Profile
          </a>
        </div>
      </div>
      {/* Recently Added Anime Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2">
        <p className="text-center font-bold text-xl mb-4 text-gray-800">Recently Added</p>
        <ul className="space-y-4">
          {recentAnime.map((anime) => (
            <li key={anime.mal_id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <img src={anime.image_url} alt={anime.title} className="h-24 rounded-lg shadow-md"/>
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
            <p className="text-black text-center font-semibold" >Friends</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 md:w-1/2">
            <p className="text-black text-center font-semibold">Following</p>
        </div>
    </div>
  </div>
);
}

export default Profile;