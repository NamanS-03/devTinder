import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage/landingPage";

function App() {
  return (
    <BrowserRouter basename="/devTinder">
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
