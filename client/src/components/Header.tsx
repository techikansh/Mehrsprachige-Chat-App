import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { IoLogInOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../store/userSlice";

// sm: 640px  (min-width: 640px)
// md: 768px  (min-width: 768px)
// lg: 1024px (min-width: 1024px)
// xl: 1280px (min-width: 1280px)
// 2xl: 1536px (min-width: 1536px)

const Header = () => {
  const { isAuthenticated, firstName, lastName } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className=" flex justify-between py-2 px-10 sm:px-14 md:px-18 lg:px-24 2xl:px-28 items-center border-b border-gray-200 bg-white shadow-md">
      <div className="flex items-center gap-3 hover:cursor-pointer" onClick={() => navigate("/")} title="Home">
        <svg
          className="h-8 w-8 text-blue-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <h1 className="text-2xl font-semibold">Teams</h1>
      </div>

      <div className="flex gap-3 items-center hover:cursor-pointer" onClick={() => navigate("/profile")} title="Profile">
        {isAuthenticated && (
          <div className="bg-gray-800 text-white p-2 py rounded-full">{firstName?.charAt(0)}{lastName?.charAt(0)}</div>
        )}

        {isAuthenticated ? (
          <button className=" flex gap-2 items-center border p-2 rounded-md shadow-sm hover:shadow-md" onClick={() => dispatch(logout())}>
            <IoLogOutOutline />
            Logout
          </button>
        ) : (
          <button
            className=" flex gap-2 items-center border p-2 rounded-md shadow-sm hover:shadow-md"
            onClick={logoutHandler}
          >
            <IoLogInOutline />
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
