import { Route, Routes } from "react-router";
import { ROUTE_PATHS } from "../config/site";
import About from "../pages/About";
import Connect from "../pages/Connect";
import Home from "../pages/Home";
import Meetings from "../pages/Meetings";
import Newcomers from "../pages/Newcomers";
import NotFound from "../pages/NotFound";
import Resources from "../pages/Resources";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.home} element={<Home />} />
      <Route path={ROUTE_PATHS.meetings} element={<Meetings />} />
      <Route path={ROUTE_PATHS.about} element={<About />} />
      <Route path={ROUTE_PATHS.newcomers} element={<Newcomers />} />
      <Route path={ROUTE_PATHS.resources} element={<Resources />} />
      <Route path={ROUTE_PATHS.connect} element={<Connect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
