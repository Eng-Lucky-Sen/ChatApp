import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import avatar_icon from "../assets/avatar_icon.png";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {

  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ FIXED

    try {
      if (!selectedImg) {
        await updateProfile({ fullName: name, bio });
        navigate("/");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Image = reader.result;

        await updateProfile({
          profilePic: base64Image,
          fullName: name,
          bio,
        });

        navigate("/");
      };

      reader.readAsDataURL(selectedImg);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0c29]">

      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border border-gray-700 flex items-center justify-between max-sm:flex-col-reverse rounded-xl shadow-lg">

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg font-semibold text-white">Profile Details</h3>

          {/* IMAGE UPLOAD */}
          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />

            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || avatar_icon
              }
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            <span>Upload profile image</span>
          </label>

          {/* NAME */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent text-white"
          />

          {/* BIO ✅ FIXED */}
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write Profile bio"
            required
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent text-white"
          ></textarea>

          {/* BUTTON */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer hover:scale-105 transition"
          >
            Save
          </button>
        </form>

        {/* RIGHT IMAGE PREVIEW */}
        <img
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover"
          src={
            selectedImg
              ? URL.createObjectURL(selectedImg)
              : authUser?.profilePic || assets.logo_icon
          }
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfilePage;