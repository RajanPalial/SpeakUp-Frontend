import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = ({ active, setActive, hoverShow }) => {
  const [hidden, setHidden] = useState(false);
  const navigate = useNavigate();
  
  const toggleNavbar = () => {
    setHidden(!hidden);
  };

  const closeToggle = () => {
    setHidden(!hidden);
    const menuToggle = document.getElementById("navbarSupportedContent");
    menuToggle.classList.remove("show");
  };
const baseurl = import.meta.env.VITE_API_BASE_URL
  const handleOnClick = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found");
        localStorage.clear();
        navigate("/");
        return;
      }

      // Make logout API call
      const response = await fetch(
        `${baseurl}/api/auth/logout`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      // Clear localStorage and redirect on success
      localStorage.clear();
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear data and redirect even if API fails
      localStorage.clear();
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="d_header d-flex justify-content-between bg-dark">
        <div className="left_header d-flex align-items-center ">
          <div className="logo transition">
            <h2 className="text-light mb-0">SpeakUp</h2>
          </div>
          <button
            type="button"
            className="trans_btn  bg-transparent border-0 "
            onClick={() => setActive(!active)}
          >
            <img
              src="images/icons/back.svg"
              alt="arrow"
              style={active ? { transform: "rotateY(180deg)" } : {}}
            />
          </button>
        </div>

        <div className="profile_box d-flex align-items-center gap-3">
          <div className="user_name"></div>

          <div className="dropdown">
            <button
              className="btn border-0  dropdown-toggle"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ fill: "#fff" }}
                height="1em"
                viewBox="0 0 512 512"
              >
                <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
              </svg>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li>
                <a className="dropdown-item" href="#">
                  <button
                    className="active_btn_logout p-2"
                    onClick={handleOnClick}
                  >
                    Logout
                  </button>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;