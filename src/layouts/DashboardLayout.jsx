import React, { useContext, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "../components/dashboard/Header";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";

const DashboardLayout = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [hoverShow, setHoverShow] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (window.innerWidth < 991) {
      setActive(true);
    } else {
      setActive(false);
    }
    const token = localStorage.getItem("token");
    const { accessToken } = auth;
    if (!token) {
      navigate("/");
    }
  }, []);

  const handleClick = () => {
    console.log("Active:", active, "hoverShow==", hoverShow);
  };

  return (
    <>
      {/* <button  onClick={handleClick} >my btn</button> */}
      <section className="layout_sec">
        <div className="cus_container">
          <div className="dashboard ">
            <div className="layout-Header">
              <Header
                setActive={setActive}
                active={active}
                setHoverShow={setHoverShow}
                hoverShow={hoverShow}
              />
            </div>
            <div
              className={`layout-sidebar transition ${
                hoverShow ? "ShowBar" : ""
              } ${active ? "activeBar" : ""}`}
              onMouseEnter={() => (active ? setHoverShow(true) : {})}
              onMouseLeave={() => (active ? setHoverShow(false) : {})}
            >
              <Sidebar active={active} />
            </div>
            <div
              className={`layout-main-container transition ${
                hoverShow ? "marginshow" : ""
              } ${active ? "marginBar" : ""}`}
            >
              <div className="inner_layout">
                <main>{children}</main>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default DashboardLayout;
