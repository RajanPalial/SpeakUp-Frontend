import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Pagination from "../../components/Pagination";
import { handleAddAllowances } from "../withdrawalFunctions/handleAddAllowances";
import { handleWithdrawTransaction } from "../withdrawalFunctions/handleWithdrawTransaction";

const WithdrawReport = () => {
  // INITIALIZE USESTATES--------------------------------------
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({});
  const [checkBoxId, setCheckBoxId] = useState([]);
  const [txnHash, setTxnHash] = useState([])
  const [showAllowanceBtn, setShowAllowanceBtn] = useState(false);
  const [walletAddress, setWalletAddress] = useState([]);
  const [contAddress, setContAddress] = useState([]);

  const [allowanceLoader, setAllowanceLoader] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [amountSend, setAmountSend] = useState([]);
  const [wdLoading, setWdLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [tData, setTData] = useState([]);
  const [selectedCheckboxesAcrossTabs, setSelectedCheckboxesAcrossTabs] =
    useState({});
  const [state, setState] = useState({
    search: "",
    status: "0",
    perPage: 10,
    currentPage: 1,
  });
  const [withdrawalState, setWithdrawalState] = useState({
    withdrawalId: [], // checkBoxId
    withdrawalStatus: "",
    withdrawalHash: "",
  });
  const [checkboxState, setCheckboxState] = useState({
    amountSum: 0,
    selectedKeys: [],
  });

  // BASE URL IMPORT FROM ENV FILE------------------------------------------------
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const URL = `${BASE_URL}/admin/get-withdrawal?limit=${state?.perPage}&page=${state?.currentPage}&searchParam=${state.search}&status=${state.status}`;
  let token = localStorage.getItem("token");

  // Get Withdrawal Transaction api ----------------------------------------------------
  const getTData = () => {
    fetch(URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/");
          }
          throw new Error("Network response was not ok");
        }
        const abc = await response.json();
        return abc;
      })
      .then((res) => {
        setTData(res?.data);
      })
      .catch((err) => console.log(err));
  };

  // _________________ GET TOTAL AMOUNT _______________________
  const getTotalValue = () => {
    let total = 0;
    Object.keys(checkedItems)?.forEach((key) => {
      if (checkedItems[key]) {
        const selectedOption = tData?.rows?.find((option) => option?.id == key);
        total = total + Number(selectedOption?.amt_usd);
      }
    });
    return total;
  };

  // Function for the select checkbox  -------------------------------------------------- 
  const handleCheckBoxChange = (e, values, id) => {
    const { checked } = e.target;
    const updatedIds = [...checkBoxId];
    const selectedKeys = checkboxState?.selectedKeys;
    const indexToRemove = updatedIds.indexOf(id);

    if (checked) {
      // Add the id to the updatedIds array if it's not already included
      if (!updatedIds.includes(id)) {
        updatedIds.push(id);
      }

      // Add the id to the selectedKeys array
      selectedKeys.push(parseInt(id));
    } else {
      // Remove the id from the updatedIds array
      updatedIds.splice(indexToRemove, 1);

      // Remove the id from the selectedKeys array
      selectedKeys.splice(selectedKeys.indexOf(parseInt(id)), 1);
    }

    // Update the state with the new arrays
    setCheckedItems({ ...checkedItems, [id]: checked });
    setCheckBoxId(updatedIds);
    setSelectedItems((prevItems) =>
      checked
        ? [
            ...prevItems,
            {
              id: values?.id || "",
              address: values?.user?.address || "",
              amount: values?.amt_in_token || "",
              contractAddress:
                "0xA24d12C23676e9B9344629cB59E5d830900B11BA" || "", // static contract address....!
            },
          ]
        : prevItems.filter((item) => item.id !== values.id)
    );

    setSelectedCheckboxes((prevCheckboxes) => ({
      ...prevCheckboxes,
      [values?.id]: checked,
    }));
    setSelectedCheckboxesAcrossTabs((prevCheckboxes) => ({
      ...prevCheckboxes,
      [values?.id]: checked,
    }));

    const anyCheckboxSelected = Object.values(
      selectedCheckboxesAcrossTabs
    ).some((value) => value);
    setIsButtonVisible(anyCheckboxSelected);
    updateSelectedCheckboxes(values?.id, checked);
  };


  const updateSelectedCheckboxes = (id, checked) => {
    setSelectedCheckboxes((prevCheckboxes) => ({
      ...prevCheckboxes,
      [id]: checked,
    }));
    setSelectedCheckboxesAcrossTabs((prevCheckboxes) => ({
      ...prevCheckboxes,
      [id]: checked,
    }));

    // Update send button visibility based on selected checkboxes
    const anyCheckboxSelected = Object.values(
      selectedCheckboxesAcrossTabs
    ).some((value) => value);
    setIsButtonVisible(anyCheckboxSelected);
  };


  // _______ updated Code ___________ start ________________
  const handleCheckAll = (e, data) => {
    // setSmartContract(currencyType == "USDT" ? USDT_CONTRACT : METG_CONTRACT);
    const { checked } = e.target;
    let selectedCheckBoxItems;

    // Note:- We don't need to use ...state here in any useState
    if (checked) {
      // if Selected All is checked, selected all checkboxes from data
      selectedCheckBoxItems = data?.reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: true,
        }),
        {}
      );
      const getItemIds = data.map((item) => item.id);
      const amountSum = tData?.rows?.reduce(
        (acc, item) => acc + Number(item.amt_usd),
        0
      );
      setCheckedItems(selectedCheckBoxItems);
      setSelectedItems(
        data?.map((item) => ({
          id: item.id,
          address: item.user.wallet_address,
          amount: item.amt_in_token,
          contractAddress: "0xd978ac03c2bf932358772e8b0609bd8f972ee5fd", // static contract
        }))
      );
      setCheckboxState({
        selectedKeys: getItemIds,
        amountSum: amountSum,
      });
      setCheckBoxId(getItemIds);
      setSelectedCheckboxes(selectedCheckBoxItems);
      setSelectedCheckboxesAcrossTabs(selectedCheckBoxItems); // Update selected checkboxes across tabs
    } else {
      // If unchecked, remove the item from selectedItems and  checkedItems
      selectedCheckBoxItems = {};
      setCheckedItems({});
      setSelectedItems([]);
      // Empty CheckBoxId && setCheckboxState
      setCheckBoxId([]);
      setCheckboxState({
        selectedKeys: [],
        amountSum: 0,
      });
      setSelectedCheckboxes(selectedCheckBoxItems);
      setSelectedCheckboxesAcrossTabs(selectedCheckBoxItems); // Update selected checkboxes across tabs
    }

    //toggle Select All checkbox
    setSelectAll(!selectAll);
  };

  // _________ updated code ___________________ 01 -may  ___________ END
  // const handleRejectTransaction = async () => {
  //   setPageLoad(true);
  //   const response = await approveTransaction({
  //     id: checkBoxId,
  //     status: 3,
  //     txn_hash: "",
  //   });
  //   if (response?.data?.status == 1) {
  //     toast.success(response?.data?.data);
  //     setCheckBoxId([]);
  //     setCheckedItems([]);
  //     setPageLoad(false);
  //   }
  //   if (response?.data?.data == 0) {
  //     toast.error(response?.data?.data);
  //     setCheckedItems([]);
  //     setPageLoad(false);
  //   }
  // };
  const handleRejectTransaction = async () => {
    const requestBody = {
      id: checkBoxId,
      status: 2,
      txn_hash: "",
    };
    fetch(`${BASE_URL}/admin/withdraw-approval`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }).then((res) => {
      console.log("resiiiiii", res);
      if (res?.status == 400) {
      }
    });
    // .then((response) => {
    //   if (!response.ok) {
    //     if (response.status === 401) {
    //       alert("INVALID TXNN.....!!!!!!!!");
    //       // localStorage.removeItem("token");
    //       // navigate("/");
    //     }
    //     throw new Error("Network response was not ok");
    //   }
    //   toast.success("Transaction is being processed, Pleat wait..!");
    // })
    // .then((res) => {
    //   console.log(res);
    // })
    // .catch((err) => console.log(err));
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      getTData();
    }, 1000);
    return () => clearTimeout(debounce);
  }, [state]);
  return (
    <div>
      <DashboardLayout>
        <section className="staking_sec ">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="activation-card cus_card-1">
                  <div className="activation-card-header d-block d-md-flex justify-content-between align-items-center pt-4 px-3 pb-3 rounded-3">
                    <h2 className="mb-3 mb-md-0">Withdrawal Report</h2>

                    <div className="status mb-3 mb-md-0">
                      <select
                        className="text-light px-2 py-1 rounded bg-dark border-0"
                        onChange={(e) =>
                          setState({ ...state, status: e.target.value })
                        }
                      >
                        <option value="">Select Status</option>
                        <option value="0">Pending</option>
                        <option value="1">InProgress</option>
                        <option value="2">Approve</option>
                        <option value="3">Rejected</option>
                      </select>
                    </div>
                    <div className="search-input">
                      <div className="input-group rounded-2">
                        <input
                          type="text"
                          className="form-control bg-transparent border-0 shadow-none"
                          placeholder="Search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          onChange={(e) =>
                            setState({ ...state, search: e.target.value })
                          }
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

                  <div className="row my-3">
                    <div className="col-12 col-sm-6 col-md-4">
                      <div className="mt-3">
                        {checkBoxId?.length > 0 ? (
                          <div className="d-flex align-items-center ms-4">
                            <p className="text-light mb-0 me-2">Amount</p>
                            <input
                              disabled
                              type="text"
                              value={getTotalValue() || ""}
                              className=" rounded border-0 text-light p-2 me-2"
                            />
                            {/* <span>{currencyType || ""}</span> */}
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      {/* {withdrawInputBox ? ( */}
                      <span className="mt-3">
                        {showAllowanceBtn ? (
                          allowanceLoader ? (
                            <button className="btn btn-outline-secondary">
                              <span className="loader">
                                <Spinner
                                  size="sm"
                                  animation="border"
                                  variant="secondary"
                                />
                              </span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-info"
                              onClick={() =>
                                handleAddAllowances({
                                  setAllowanceLoader,
                                  setShowAllowanceBtn,
                                })
                              }
                            >
                              Add Allowance
                            </button>
                          )
                        ) : (
                          ""
                        )}
                        {showAllowanceBtn && (
                          <button
                            className="btn btn-outline-info"
                            disabled={allowanceLoader}
                            onClick={() => {
                              handleAddAllowances({
                                setAllowanceLoader,
                                setShowAllowanceBtn,
                                setPageLoad,
                              });
                            }}
                          >
                            {allowanceLoader ? (
                              <div className="spinner-border" role="status">
                                <span className="visually-hidden"></span>
                              </div>
                            ) : (
                              "Add Allowance"
                            )}
                          </button>
                        )}
                      </span>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <div className="text-end mt-3">
                        {checkBoxId?.length > 0 ? (
                          <div className="d-flex justify-content-start justify-content-md-end">
                            {
                              <button
                                className="btn btn-outline-warning"
                                // disabled={transactionLoading}
                                // onClick={() => handleWithdrawTransaction()}   // same component
                                onClick={() => {
                                  handleWithdrawTransaction({
                                    amountSend,
                                    setWdLoading,
                                    setWithdrawalState,
                                    walletAddress,
                                    contAddress,
                                    checkBoxId,
                                    setAllowanceLoader,
                                    setShowAllowanceBtn,
                                    // setRefreshApi,
                                    // setStakingData,
                                    setCheckBoxId,
                                    // navigate,
                                    selectedItems,
                                    approveTransaction,
                                    setCheckedItems,
                                    setPageLoad,
                                  });
                                }}
                              >
                                {wdLoading ? (
                                  <div className="spinner-border" role="status">
                                    <span className="visually-hidden"></span>
                                  </div>
                                ) : (
                                  "Withdraw"
                                )}
                              </button>
                            }
                            <button
                              className="mx-3 btn btn-outline-danger"
                              onClick={() => {
                                setWithdrawalState({
                                  ...withdrawalState,
                                  withdrawalId: checkBoxId,
                                  withdrawalHash: "",
                                  withdrawalStatus: 0,
                                }),
                                  handleRejectTransaction();
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="activation-card-body">
                    <div className="table-responsive text-nowrap">
                      <table className="table ">
                        <thead>
                          <tr className="activation-card-head">
                            <th>Sr. No.</th>
                            {/* {state.status == "Pending" && (
                              <th scope="col">
                                Select All
                                <input
                                  style={{ cursor: "pointer" }}
                                  type="checkbox"
                                  id="selectAll"
                                  onChange={(e) => {
                                    handleCheckAll(
                                      e,
                                      withdrawReport?.data?.response?.rows
                                    );
                                    // setAmountSend([]);
                                  }}
                                  // onChange={(e)=>handleBothCheckBox(e,"id" )}
                                  checked={selectAll}
                                />
                              </th>
                            )} */}
                            <th>Select</th>
                            <th>User ID</th>
                            <th>Wallet Address</th>
                            <th>Contract Address</th>
                            <th>Amount in USDT</th>
                            <th>Txn Hash</th>
                            <th>Status</th>
                            <th>Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tData?.rows?.length !== 0 ? (
                            <>
                              {tData?.rows?.map((val, i) => {
                                let status = val?.status;
                                return (
                                  <tr className="activation-card-data" key={i}>
                                    <td> {++i} </td>
                                    {val.status == "0" && (
                                      <td>
                                        <input
                                          style={{ cursor: "pointer" }}
                                          type="checkbox"
                                          id="singleCheckBox"
                                          checked={
                                            selectedCheckboxes[val?.id] || false
                                          }
                                          // checked={checkboxState?.selectedKeys?.includes(id)}
                                          onChange={(e) =>
                                            handleCheckBoxChange(e, val, val.id)
                                          }
                                          // onChange={(e)=>handleBothCheckBox(e, id)}
                                        />
                                      </td>
                                    )}
                                    <td>
                                      {" "}
                                      {val.user_id ? val.user_id : "N/A"}{" "}
                                    </td>
                                    <td>
                                      {" "}
                                      {val.address
                                        ? `${val.address.slice(
                                            0,
                                            5
                                          )}*****${val.address.slice(35)}`
                                        : ""}{" "}
                                    </td>
                                    <td>
                                      {" "}
                                      {val.contract_address
                                        ? `${val.contract_address.slice(
                                            0,
                                            5
                                          )}*****${val.contract_address.slice(
                                            35
                                          )}`
                                        : ""}{" "}
                                    </td>
                                    <td>
                                      {" "}
                                      {val.amount
                                        ? Number(val.amount).toFixed(2)
                                        : 0}{" "}
                                    </td>
                                    <td>
                                      {val?.txn_hash
                                        ? `${val?.txn_hash.slice(
                                            0,
                                            5
                                          )}*****${val?.txn_hash.slice(60)}`
                                        : "N/A"}
                                    </td>

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
                                    <td>
                                      {" "}
                                      {val.created_at
                                        ? new Date(
                                            val.created_at
                                          ).toLocaleString()
                                        : "N/A"}{" "}
                                    </td>
                                    {/* <td> {val.note} </td> */}
                                    {/* 0 for pending , 1 for in progress , 2 for success , 3 for failed okay sir  */}
                                  </tr>
                                );
                              })}
                            </>
                          ) : (
                            <tr>
                              <td className="text-center" colSpan={6}>
                                No Record is Found
                              </td>{" "}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="pagi mt-4 ">
                  <div className="text-light">
                    <span className="me-2">Per Page</span>
                    <select
                      className=""
                      onChange={(e) =>
                        setState({ ...state, perPage: e.target.value })
                      }
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                    </select>
                  </div>
                  <div className="text-end">
                    {tData?.rows?.length > 0 ? (
                      <div>
                        <Pagination
                          page={state}
                          setPage={setState}
                          totalPage={tData?.count}
                          perPage={state?.perPage}
                        />
                      </div>
                    ) : (
                      ""
                    )}
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

export default WithdrawReport;
