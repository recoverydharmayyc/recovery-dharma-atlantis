import { BrowserRouter } from "react-router";
import SiteLayout from "../components/SiteLayout";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter useTransitions={false}>
      <SiteLayout>
        <AppRoutes />
      </SiteLayout>
    </BrowserRouter>
  );
}
