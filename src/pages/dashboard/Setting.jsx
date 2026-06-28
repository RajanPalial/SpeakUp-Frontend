import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import axios from "../../api/axios";
import { toast } from "react-toastify";

const Setting = () => {
  const token = localStorage.getItem("token");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [dataSetting, setDataSetting] = useState("");

  const data = [
    {
      name: "maintenance",
      is_block: `${dataSetting?.maintenance}`,
    },
    {
      name: "register",
      is_block: `${dataSetting?.register}`,
    },
    {
      name: "staking",
      is_block: `${dataSetting?.staking}`,
    },
    {
      name: "withdraw",
      is_block: `${dataSetting?.withdraw}`,
    },
  ];

  const getDashBoardData = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/setting/get`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data?.status === 1) {
        // toast.success(data?.message);
        setDataSetting(data?.data);
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      toast.error(error?.message)
    }
  };

  const handleToggle = async (e, val) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/setting/change-settings`,
        {
          key: val,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res?.data?.status == 1) {
        toast.success(res?.data?.message)
        getDashBoardData();
      }
    } catch (error) {
      toast.error(error?.message)

    }
  };

  useEffect(() => {
    getDashBoardData();
  }, []);

  return (
    <div>
      <DashboardLayout>
        <div className="setting_page py-5 px-3 rounded-4">
          <div className="cointainer-fluid">
            <div className="setting_heading">
              <h3 className="mb-4">Software Setting</h3>

              {data?.map((val, i) => {
                return (
                  <div className="form-check form-switch d-flex" key={i}>
                    <input
                      className="form-check-input shadow-none me-3"
                      type="checkbox"
                      id="flexSwitchCheckDefault"
                      onChange={(e) => {
                        handleToggle(e, val?.name);
                      }}
                      checked={val?.is_block == "true" ? true : false}
                    />
                    <span>
                      <p>{val.name}</p>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Setting;
