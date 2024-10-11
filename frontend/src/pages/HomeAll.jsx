import React from "react";
import bg_img from "../assets/bg-home.jpg";

function HomeAll() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center text-white suse-font"
            style={{backgroundImage: `url(${bg_img})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
        >
            <h1 className="text-4xl font-bold mb-4 animate-bounce ">Do you want something new in your life?</h1>
            <p className="text-lg mb-8 font-semibold">Find new titles to watch</p>
            <a href="/register"
               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110">
                Register Now
            </a>
            <a href="/login"
               className="bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110 mt-8">
                I already have an account
            </a>
        </div>
    );
}

export default HomeAll;