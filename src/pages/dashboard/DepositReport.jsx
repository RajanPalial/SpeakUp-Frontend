import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loader from "../../Loader";

const DepositReport = () => {
    
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const URL = `${BASE_URL}/users/get-transactions`;

  const [tData, setTData] = useState([]);

  let token = localStorage.getItem("token");

  const getTData = async () => {
    fetch(URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
          throw new Error("Network response was not ok");
        }
        console.log({ response });
        return response.json();
      })
      .then((res) => {
        setTData(res?.data?.rows);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getTData();
  }, []);

  return (
    <div>
      {console.log(tData)}
      <DashboardLayout>
        <section className="staking_sec ">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="activation-card cus_card-1">
                  <div className="activation-card-header d-flex justify-content-between align-items-center pt-4 px-3 pb-3 rounded-3">
                    <h2 className="m-0"> Deposit Report</h2>
                    <div className="search-input">
                      <div className="input-group rounded-2">
                        <input
                          type="text"
                          className="form-control bg-transparent border-0 shadow-none"
                          placeholder="Search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                        />
                        <span
                          className="input-group-text bg-transparent shadow-none border-0"
                          id="basic-addon1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            style={{ fill: " var(--place-holder)" }}
                          >
                            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="activation-card-body">
                    <div className="table-responsive text-nowrap">
                      <table className="table ">
                        <thead>
                          <tr className="activation-card-head">
                            <th>Date</th>
                            <th>Wallet Address</th>
                            <th>Amount</th>
                            <th>Transaction Hash</th>
                            <th>Status</th>
                            <th>Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tData.map((val, i) => {
                            let status = val?.status;
                            return (
                              <tr className="activation-card-data" key={i}>
                                <td> {val.created_at} </td>
                                <td> {val.wallet_address} </td>
                                <td> {val.amount_in_usd} </td>
                                <td> {val.txn_hash} </td>
                                <td>
                                  {" "}
                                  {status === 2
                                    ? "Success"
                                    : status === 1
                                    ? "In Progress"
                                    : status === 0
                                    ? "Pending"
                                    : "Failed"}{" "}
                                </td>
                                <td> {val.note} </td>
                                {/* 0 for pending , 1 for in progress , 2 for success , 3 for failed okay sir  */}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </div>
  );
};

export default DepositReport;
