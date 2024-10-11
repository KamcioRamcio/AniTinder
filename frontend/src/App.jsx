import React from 'react'
import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom'
import RegisterPage from './pages/RegisterPage.jsx'
import Login from './pages/Login'
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomeAll from "./pages/HomeAll.jsx";
import Find from "./pages/Find.jsx";
import AnimeList from "./pages/AnimeList.jsx";
import Profile from "./pages/profile/Profile.jsx";
import ProfileEdit from "./pages/profile/ProfileEdit.jsx";
import PSWReset from "./pages/password/PasswordReset.jsx";
import ProfileAll from "./pages/profile/ProfileAll.jsx";
import AnimeListAll from "./pages/AnimeListAll.jsx";
import Chat from "./pages/Chat.jsx";

function App() {

    return(
    <div className="bg-slate-900">
        <BrowserRouter >
            <Routes >

                <Route path="/home" element={
                    <ProtectedRoute>
                        <Find/>
                    </ProtectedRoute>
                } />
                <Route
                path="/animelist"
                element={
                    <ProtectedRoute>
                        <AnimeList/>
                    </ProtectedRoute>
                }
                >
                </Route>
                <Route path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile/>
                    </ProtectedRoute>
                }
                >
                </Route>
                <Route path="/profile-edit"
                element={
                    <ProtectedRoute>
                        <ProfileEdit/>
                    </ProtectedRoute>
                }
                >
                </Route>

                <Route path="/resetpassword"
                element={
                    <ProtectedRoute>
                        <PSWReset/>
                    </ProtectedRoute>
                }
                >
                </Route>
                <Route path="/chat"
                element={
                    <ProtectedRoute>
                        <Chat/>
                    </ProtectedRoute>
                }
                >
                </Route>

                <Route path="/profile/:userId" element={<ProfileAll />} />
                <Route path="/anime-list/:userId" element={<AnimeListAll />} />
                <Route path="/" element={<HomeAll />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" />} />

            </Routes>

        </BrowserRouter>
    </div>


    )
}

export default App
