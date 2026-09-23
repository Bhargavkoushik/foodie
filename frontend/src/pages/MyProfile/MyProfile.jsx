/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Avatar, Dialog, DialogContent, DialogTitle } from '@mui/material'
import toast from 'react-hot-toast'
import apiRequest from '../../lib/apiRequest'
import './MyProfile.css'

const MyProfile = () => {
    const location = useLocation();
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || { name: "Guest User", email: "guest@example.com" };
        } catch {
            return { name: "Guest User", email: "guest@example.com" };
        }
    });

    const [update, setUpdate] = useState({
        name: user.name || "",
        email: user.email || "",
        password: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiRequest.get('/api/user/profile');
                if (res.data?.user) {
                    setUser(res.data.user);
                    setUpdate(prev => ({
                        ...prev,
                        name: res.data.user.name || prev.name,
                        email: res.data.user.email || prev.email,
                    }));
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    window.dispatchEvent(new Event("storage"));
                }
            } catch (err) {
                // If not authenticated or error, continue using localStorage
            }
        };
        fetchProfile();
    }, []);

    const handleProfileClose = () => setOpenProfileModal(false);
    const handleOpenProfile = () => {
        setUpdate({
            name: user.name || "",
            email: user.email || "",
            password: ""
        });
        setOpenProfileModal(true);
    };

    useEffect(() => {
        if (location.search.includes("edit=true") || location.state?.edit) {
            handleOpenProfile();
        }
    }, [location.search, location.state]);

    const handleSave = async () => {
        try {
            const payload = {};
            if (update.name) payload.name = update.name.trim();
            if (update.email) payload.email = update.email.trim();
            if (update.password && update.password.trim()) payload.password = update.password.trim();

            const res = await apiRequest.patch('/api/user/profile', payload);
            const updatedUser = res.data?.user || { ...user, ...payload };

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
            toast.success("Profile updated successfully!");
            setUpdate(prev => ({ ...prev, password: "" }));
            handleProfileClose();
        } catch (error) {
            console.error("Update profile error:", error);
            const errMsg = error.response?.data?.message || "Failed to update profile";
            toast.error(errMsg);
        }
    };

    return (
        <>
            <div className="my-profile">
                <Avatar variant='square' sx={{ width: 200, height: 200, fontSize: '4rem', bgcolor: 'tomato' }}>
                    {(user.name?.[0] || 'U').toUpperCase()}
                </Avatar>
                <div className="my-profile-detail">
                    <div className="my-profile-name">
                        <b>Name</b>
                        <p>{user.name || "Guest User"}</p>
                    </div>
                    <div className="my-profile-email">
                        <b>Email</b>
                        <p>{user.email || "guest@example.com"}</p>
                    </div>
                    <div className="my-profile-password">
                        <b>Password</b>
                        <p>••••••••</p>
                    </div>
                    <button className='profile-btn' onClick={handleOpenProfile}>Update Profile</button>
                    <Dialog open={openProfileModal} onClose={handleProfileClose}>
                        <DialogTitle align="center">Update Profile</DialogTitle>
                        <DialogContent>
                            <div className="update-my-profile">
                                <input
                                    type="text"
                                    placeholder='Update Name'
                                    value={update.name}
                                    onChange={(e) => setUpdate({...update, name: e.target.value})}
                                    name='name'
                                />
                                <input
                                    type="email"
                                    placeholder='Update Email'
                                    value={update.email}
                                    onChange={(e) => setUpdate({...update, email:  e.target.value})}
                                    name='email'
                                />
                                <input
                                    type="password"
                                    placeholder='Update Password'
                                    value={update.password}
                                    onChange={(e) => setUpdate({...update, password:  e.target.value})}
                                    name='password'
                                />
                            </div>
                            <button className='update-btn' onClick={handleSave}>Save</button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    )
}

export default MyProfile