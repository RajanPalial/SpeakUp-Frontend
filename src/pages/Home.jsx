import React, { useEffect, useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';


export default function Home() {
  const notify = () => toast(error);
  const [searchParams] = useSearchParams(); 
  const refer = searchParams.get("refer");
  
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [referralId, setReferralId] = useState(refer || "");
  const [error, setError] = useState(null); // State to store the error message

  const handleConnectToWallet = () => {

    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          setAccount(accounts[0]);

          // Assuming you have an API endpoint for registration
          const apiUrl = "http://192.168.10.220:4000/api/users/wallet-connect";
          // const apiUrl = "http://192.168.11.62:4000/api/users/wallet-connect";
          const requestBody = {
            wallet_address: accounts[0],
          };

          fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.status) {
                localStorage.setItem("token", data.data.token);
                navigate("/dashboard");
              } else {
                setError(data.errors[0].msg);
              }
            })
            .catch((error) => {
              console.error("API request error:", error);
              setError("Wallet Connect failed. Please try again.");
            });

        })
        .catch((error) => {
          console.error(error);
        });
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    } else {
      setError("Wallet Connect failed. Please try again.");
    }
  };
  useEffect(() => {
    if (refer) {
        setReferralId(refer);
    }
}, [refer]);

console.log(referralId)
  const handleRegister = () => {

    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          setAccount(accounts[0]);

          // const apiUrl = "http://192.168.11.62:4000/api/users/register";
          const apiUrl = "http://localhost:4000/api/users/register";

          const requestBody = {
            wallet_address: accounts[0],
            direct_sponser_id: referralId,
          };

          fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.status) {
                localStorage.setItem("token", data.data.token);
                navigate("/dashboard");
              } else {
                setError(data.errors[0].msg);
              }
            })
            .catch((error) => {
              console.error("API request error:", error);
              setError("Registration failed. Please try again.");
            });

        })
        .catch((error) => {
          console.error(error);
        });
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    } else {
      console.error(
        "MetaMask or a compatible Ethereum wallet is not installed."
      );
    }
  };

  return (
    <>
     {/* {console.log('working from home')} */}
      <section
        className="login__sec d-flex align-items-center bgColor justify-content-center"
        style={{ height: " 100vh" }}

      >
        

        <div className="container">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )};
          <div className="row">
            <div className="col-md-12 col-lg-6 col-xl-12 col-xxl-12 mb-4">
              <div className="swap_tab cus_card p-0 pt-2 ">
                <div className="tab-content cus_tab p-4" id="pills-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="pills-withdrawal"
                    role="tabpanel"
                    aria-labelledby="pills-withdrawal-tab"
                    >
                    <form>
                      <div className="text-center mb-4">
                        <img src="images/logo.png" alt="logo" style={{ maxHeight: '50px' }} />
                      </div>
                    <h3 className="headingLogin mb-3">REGISTER WITH US</h3>
                      <div className="form_box mb-3">
                        {/* <label className="form-label">
                              Amount <span>(Min withdrawal = 10 $)</span>
                            </label> */}
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control shadow-none"
                            placeholder="Enter Referral ID "
                            aria-describedby="basic-addon1"
                            name="referral_id"
                            value={referralId}
                            onChange={(e) => setReferralId(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form_box text-center">
                     
      
                        <button
                          type="button"
                          className="active_btn px-3 py-2 mt-2"
                          onClick={handleRegister}
                          // onClick={notify}
                        >
                            <ToastContainer />
                          Register
                        </button>
                      </div>
                    </form>
                    <h4 className="mt-3">Connect to Wallet</h4>
                    <button
                          type="button"
                          className="active_btn_wallet px-3 py-2  mb-3 mt-2"
                          onClick={handleConnectToWallet}
                        >
                          Connect to Wallet
                        </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
