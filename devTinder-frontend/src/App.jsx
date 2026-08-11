import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage/landingPage";
import Home from "./components/homePage/Home";
import AppLayout from "./components/commonComponents/AppLayout";
import Connections from "./components/Network/Connections";
import Requests from "./components/Network/Requests";
import Messages from "./components/Network/Messages";

function App() {
  return (
    <BrowserRouter basename="/devTinder">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/messages" element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
