import { Routes, Route } from "react-router-dom";
import Loader from "../Loader";
import { Suspense, lazy } from "react";
import Transactions from "../pages/dashboard/Transaction";
import Setting from "../pages/dashboard/Setting";
import Profile from "../pages/dashboard/TicketModule";
import Table1 from "../pages/dashboard/Courses";
import Table2 from "../pages/dashboard/Users";

export default function AppRoutes() {
  const Home = lazy(() => import("../pages/Home"));
  const WalletReport = lazy(() => import("../pages/dashboard/WalletReport"));
  const Dash = lazy(() => import("../pages/dashboard/Dashboard"));
  const Invest = lazy(() => import("../pages/dashboard/Staking"));
  const Login = lazy(() => import("../pages/auth/Login"));
  const DepositReport = lazy(() => import("../pages/dashboard/DepositReport"));

  return (
    <div>
      <Routes>
        <Route
          path="/refer/:refer"
          element={
            <Suspense fallback={<Loader />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/wallet-report"
          element={
            <Suspense fallback={<Loader />}>
              <WalletReport />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<Loader />}>
              <Dash />
            </Suspense>
          }
        />
        <Route
          path="/invest"
          element={
            <Suspense fallback={<Loader />}>
              <Invest />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <Suspense fallback={<Loader />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<Loader />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/department"
          element={
            <Suspense fallback={<Loader />}>
              <Transactions />
            </Suspense>
          }
        />

        <Route
          path="/ticket"
          element={
            <Suspense fallback={<Loader />}>
              <Profile />
            </Suspense>
          }
        /> <Route
          path="/courses"
          element={
            <Suspense fallback={<Loader />}>
              <Table1 />
            </Suspense>
          }
        /> <Route
          path="/users"
          element={
            <Suspense fallback={<Loader />}>
              <Table2 />
            </Suspense>
          }
        />

        {/* {Routing} */}
      </Routes>
    </div>
  );
}
