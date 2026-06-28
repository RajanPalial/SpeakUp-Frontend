import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ethers } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
import Web3 from "web3";
import {  useNavigate } from "react-router-dom";
const web3 = new Web3(window.ethereum)

const Staking = () => {
  const notify = () => toast(error);
  const navigate = useNavigate()
  const [amount, setamount] = useState();
  const [isBtn, setBtn] = useState(false);
  const [sData, setSData] = useState([]);
  const [error, setError] = useState(null);
  const apiUrl = "http://192.168.11.62:4000/api/users/transfer-token";


  const getSData = async () => {
    const URL = "http://192.168.11.62:4000/api/users/get-stakings";

    fetch(URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }).then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        throw new Error("Network response was not ok");
      }
      console.log({ response })
      return response.json()
    }).then((res) => {
      setSData(res?.data?.rows)
    }).catch((err) => console.log(err))

  }

  let token = localStorage.getItem("token");

  const tokenTransfer = async (txn_hash) => {
    const requestBody = {
      txn_hash,
      amount: amount,
    };
    fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
    }).then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
        alert("INVALID TXNN.....!!!!!!!!")
          // localStorage.removeItem("token");
          // navigate("/login");
        }
        throw new Error("Network response was not ok");

      }
      toast.success('Transaction is being processed, Pleat wait..!');
    }).then((res) => {
      console.log(res)
    }).catch((err) => console.log(err))

  }

  useEffect(() => {
    getSData();
  }, []);

  const { ethereum } = window;

  const tokenabi = [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "_decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }]

  const depositabi = [{ "inputs": [{ "internalType": "address", "name": "usdtaddr", "type": "address" }, { "internalType": "address", "name": "adminaddr", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_newsendingFee", "type": "uint256" }], "name": "ChangeSendingFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "GetSendingFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "payable", "type": "function" }]
  const handleInputChange = (e) => {
    setamount(e.target.value);
  };
  const depositusdt = async () => {
    try {
      setBtn(true);
      function isValidNumber(variable) {

        return typeof variable === 'number' && !isNaN(variable);

      }

      if (parseInt(amount) < 100 || amount == undefined || isValidNumber(amount) || (parseInt(amount) % 100 !== 0)) {
        setBtn(false);
        alert('Amount must be greater than equal to 100 and multiple of 100...!');
        return false;
      }

      let approveamount = (amount * 1e18).toLocaleString('en-IN', { useGrouping: false })
      console.log(approveamount)

      // const provider = new ethers.providers.JsonRpcProvider(window.ethereum)

      // // MetaMask requires requesting permission to connect users accounts
      // await provider.send("eth_requestAccounts", []);
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      let gasprice = web3.utils.toWei('3', 'gwei');
      const accounts = await web3.eth.getAccounts();

      if (parseInt(ethereum.chainId) != 56) {
        //56
        console.log("Please Change Network");
        return alert("Network Error", "Please Change Network");
      }

      // const tokeninstance = new ethers.Contract('0x55d398326f99059fF775485246999027B3197955', tokenabi, signer);
      const tokeninstance = new web3.eth.Contract(tokenabi, '0x55d398326f99059fF775485246999027B3197955')
      // const depositinstance = new ethers.Contract('0x891C38cbd9E28c04B4Dd460Bb995e4DbabA7aCF9', depositabi, signer);
      const depositinstance = new web3.eth.Contract(depositabi, '0x891C38cbd9E28c04B4Dd460Bb995e4DbabA7aCF9')
      // const approvetxn = await tokeninstance.approve('0x891C38cbd9E28c04B4Dd460Bb995e4DbabA7aCF9', approveamount);
      let approvetxn
      try {
        approvetxn = await tokeninstance.methods.approve('0x891C38cbd9E28c04B4Dd460Bb995e4DbabA7aCF9', approveamount).send({
          from: accounts[0]
          , gasPrice: gasprice
        });
      } catch (error) {
        alert(error.message)
      }

      let receipt = await web3.eth.getTransactionReceipt(approvetxn.transactionHash);

      // console.log(approvetxn)
      // let txnhash = approvetxn.hash;
      // console.log("txnhash 1st", txnhash);
      // await provider.waitForTransaction(txnhash);
      // let rec = await provider.getTransactionReceipt(txnhash);
      if (receipt.status === '0x1' || 1) {


        const valueToSend = web3.utils.toWei('0.01', 'ether'); // The Ether value you are sending, in this case 0.01 ETH

        // Construct the transaction
        const transaction = await depositinstance.methods.deposit(approveamount).send({
          from: accounts[0],
          value: valueToSend, gasPrice: gasprice
        });

        // transaction.on('receipt',async(receipt) => {
        //   console.log(receipt);
        receipt = await web3.eth.getTransactionReceipt(transaction.transactionHash);
        if (receipt.status === '0x1' || 1) {
          await tokenTransfer(transaction.transactionHash);
        }
        else {
          alert('something went wrong please try again...!')
        }
      }
      else {
        alert('something went wrong please try again....!!!!!')
      }

    } catch (error) {
      console.log(error.message)
    }
    setBtn(false);
  }
  return (
    <div>
      <DashboardLayout>
        <div className="staking_sec">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="activation-card cus_card-1">
                  <div className="activation-card-header d-flex justify-content-between align-items-center pt-4 px-3 pb-3 rounded-3">
                    <h2 className="m-0">Investment Report</h2>
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

                  <div className="cus_card px-3 pb-3">
                    <form action="" className="row justify-content-center">
                      <div className="col-md-4 main_form_box mb-5">
                        {/* <div className="form_box mb-3">
                          <label htmlFor="">Label</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control shadow-none"
                            />
                          </div>
                        </div> */}

                        <div className="form_box mb-3">
                          <label htmlFor="">Invest USDT</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control shadow-none"
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="form_box mb-3 text-center">
                          {(!isBtn) ? (
                            <button type="button" className="btn_dream" onClick={depositusdt} disabled={isBtn}>Invest</button>) : (
                            <button
                              className="btn_dream"
                              type="button"
                              disabled
                            >
                              <span
                                className="spinner-grow spinner-grow-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Loading...
                            </button>)
                          }
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="activation-card-body">
                    <div className="table-responsive text-nowrap">
                      <table className="table ">
                        <thead>
                          <tr className="activation-card-head">
                            <th>Date</th>
                            <th>NFT Units</th>
                            <th>Amount</th>
                            <th>Days Left</th>
                            <th>Daily Reward</th>
                            <th>Recieved Reward</th>
                            <th>Total Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sData.map((val, i) => {
                            return (
                              <tr className="activation-card-data" >
                                <td> {val.created_at}</td>
                                <td> {val.nft_units}</td>
                                <td> {val.amt_usd}</td>
                                <td> {val.staking_days_left}</td>
                                <td> {val.total_staking_reward}</td>
                                <td> {val.recieved_staking_reward}</td>
                                <td> {val.staking_days_total}</td>
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
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Staking;
