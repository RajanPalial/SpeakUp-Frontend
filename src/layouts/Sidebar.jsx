import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
const Sidebar = () => {
  const [isActive, setIsActive] = useState(false);
  const handleItemClick = () => {
    setIsActive(!isActive);
  };

  const location = useLocation();
  let active = location.pathname;

  const admin = localStorage.getItem('admin')

  return (
    <div>
      <div className="sidebar-list">
        <div className="accordion accordion-flush" id="accordionFlushExample">
          <ul className="list-unstyled">
            <li>
              <Link
                to="/dashboard"
                className={active == "/dashboard" ? "active" : ""}
              >
                <svg
                  className="sidebar-icon me-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 23.344 24.753"
                >
                  <g
                    id="Group_3"
                    data-name="Group 3"
                    transform="translate(824.397 64.024)"
                  >
                    <g
                      id="Group_2"
                      data-name="Group 2"
                      transform="translate(-824.397 -64.024)"
                    >
                      <g
                        id="Group_1"
                        data-name="Group 1"
                        transform="translate(0)"
                      >
                        <path
                          id="Path_1"
                          data-name="Path 1"
                          d="M107.731,14H101.2a2.065,2.065,0,0,0-2.063,2.063v9.993a2.065,2.065,0,0,0,2.063,2.063h6.534a2.065,2.065,0,0,0,2.063-2.063V16.063A2.065,2.065,0,0,0,107.731,14Zm.5,12.056a.5.5,0,0,1-.5.5H101.2a.5.5,0,0,1-.5-.5V16.063a.5.5,0,0,1,.5-.5h6.534a.5.5,0,0,1,.5.5Z"
                          transform="translate(-99.134 -14)"
                        ></path>
                        <path
                          id="Path_2"
                          data-name="Path 2"
                          d="M107.731,349.94H101.2A2.065,2.065,0,0,0,99.134,352v5a2.065,2.065,0,0,0,2.063,2.063h6.534A2.065,2.065,0,0,0,109.794,357v-5a2.065,2.065,0,0,0-2.063-2.063Zm.5,7.059a.5.5,0,0,1-.5.5H101.2a.5.5,0,0,1-.5-.5v-5a.5.5,0,0,1,.5-.5h6.534a.5.5,0,0,1,.5.5Z"
                          transform="translate(-99.134 -334.309)"
                        ></path>
                        <path
                          id="Path_3"
                          data-name="Path 3"
                          d="M380.341,242.55h-6.534a2.065,2.065,0,0,0-2.063,2.063v9.993a2.065,2.065,0,0,0,2.063,2.063h6.534a2.065,2.065,0,0,0,2.063-2.063v-9.993a2.065,2.065,0,0,0-2.063-2.063Zm.5,12.056a.5.5,0,0,1-.5.5h-6.534a.5.5,0,0,1-.5-.5v-9.993a.5.5,0,0,1,.5-.5h6.534a.5.5,0,0,1,.5.5Z"
                          transform="translate(-359.06 -231.916)"
                        ></path>
                        <path
                          id="Path_4"
                          data-name="Path 4"
                          d="M380.341,14h-6.534a2.065,2.065,0,0,0-2.063,2.063v5a2.065,2.065,0,0,0,2.063,2.063h6.534A2.065,2.065,0,0,0,382.4,21.06v-5A2.065,2.065,0,0,0,380.341,14Zm.5,7.06a.5.5,0,0,1-.5.5h-6.534a.5.5,0,0,1-.5-.5v-5a.5.5,0,0,1,.5-.5h6.534a.5.5,0,0,1,.5.5Z"
                          transform="translate(-359.06 -14)"
                        ></path>
                      </g>
                    </g>
                  </g>
                </svg>
                Dashboard
              </Link>
            </li>


            {admin == 'true' && <li>
              <Link
                to="/department"
                className={active == "/department" ? "active" : ""}
              >
                <svg className="sidebar-icon me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 9h.01" />
                  <path d="M9 13h.01" />
                  <path d="M9 17h.01" />
                  <path d="M15 9h.01" />
                  <path d="M15 13h.01" />
                  <path d="M15 17h.01" />
                </svg>
                Department
              </Link>
            </li>}

            {admin == 'true' &&<li>
              <Link
                to="/courses"
                className={active == "/courses" ? "active" : ""}
              >
                <svg className="sidebar-icon me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
                </svg>

                Courses
              </Link>
            </li>}

            <li>
              <Link
                to="/ticket"
                className={active == "/ticket" ? "active" : ""}
              >
                <svg className="sidebar-icon me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z" />
                  <path d="M12 8v8" />
                </svg>
                Ticket
              </Link>
            </li>

           {admin == 'true' && <li>
              <Link
                to="/users"
                className={active == "/users" ? "active" : ""}
              >
                <svg className="sidebar-icon me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Users
              </Link>
            </li> }
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
