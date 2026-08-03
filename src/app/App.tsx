import { BrowserRouter } from "react-router-dom";
import SiteLayout from "../components/SiteLayout";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <SiteLayout>
        <AppRoutes />
      </SiteLayout>
    </BrowserRouter>
  );
}
