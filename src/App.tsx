import { type ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import About from "./pages/About";
import Connect from "./pages/Connect";
import Home from "./pages/Home";
import Meetings from "./pages/Meetings";
import Newcomers from "./pages/Newcomers";
import Resources from "./pages/Resources";

function Page({ children }: { children: ReactNode }) {
  return <div className="page">{children}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/meetings" element={<Page><Meetings /></Page>} />
          <Route path="/about" element={<Page><About /></Page>} />
          <Route path="/newcomers" element={<Page><Newcomers /></Page>} />
          <Route path="/resources" element={<Page><Resources /></Page>} />
          <Route path="/connect" element={<Page><Connect /></Page>} />
          <Route path="*" element={<Page><Home /></Page>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
