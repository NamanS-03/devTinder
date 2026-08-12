import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import logoImage from "../../assets/devtinder-logo-final.svg";
import ConfirmModal from "../Accounts/ConfirmModal";
import { logoutUser } from "../../store/authSlice";

const Navbar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <div
      className="navbar shadow-sm px-4 sm:px-8"
      style={{ backgroundColor: "#E9E9FB" }}
    >
      <div className="navbar-start">
        <Link
          to="/home"
          className="flex items-center text-2xl font-bold gap-3 text-[#1a2a5e]"
        >
          <img src={logoImage} alt="DevTinder logo" className="h-10 w-10" />
          DevTinder
        </Link>
      </div>

      <div className="navbar-center">
        <ul className="menu menu-horizontal px-1 gap-6 text-base font-bold [&_a:hover]:!bg-[#cfcff2] [&_a:hover]:text-[#1a2a5e]">
          <li>
            <Link to="/connections">Connections</Link>
          </li>
          <li>
            <Link to="/requests">Requests</Link>
          </li>
          <li>
            <Link to="/messages">Messages</Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end flex items-center gap-4">
        <button className="btn btn-square btn-ghost">
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </button>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar placeholder"
          >
            <div className="bg-neutral text-neutral-content w-10 rounded-full">
              <span>U</span>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to="/profile" className="justify-between">
                Profile
              </Link>
            </li>
            <li>
              <a onClick={() => setIsLogoutModalOpen(true)}>Logout</a>
            </li>
          </ul>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default Navbar;
