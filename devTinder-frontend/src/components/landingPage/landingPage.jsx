import { useState } from "react";
import networkImage from "../../assets/devtinder-network-final.svg";
import logoImage from "../../assets/devtinder-logo-final.svg";
import Login from "./Login";
import Signup from "./Signup";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel */}
      <div
        className="hidden md:flex md:w-3/5 flex-col items-center justify-center p-10"
        style={{ backgroundColor: "#E9E9FB" }}
      >
        <img
          src={networkImage}
          alt="DevTinder network illustration"
          className="w-full max-w-xl"
        />
        <div className="text-center mt-8 max-w-sm">
          <h2 className="text-2xl font-bold text-[#1a2a5e]">
            Connect. Collaborate. Build.
          </h2>
          <p className="text-base-content/60 mt-2">
            Find developers who match your skills and vibes
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex md:w-2/5 flex-col justify-center px-6 sm:px-16 py-12 bg-white">
        <div className="flex items-center gap-2 mb-8">
          <img src={logoImage} alt="DevTinder logo" className="h-8 w-8" />
          <span className="text-2xl font-bold">DevTinder</span>
        </div>

        <div
          role="tablist"
          className="tabs tabs-box w-full overflow-x-auto flex-nowrap rounded-sm [&_.tab]:rounded-sm"
        >
          <a
            role="tab"
            className={`tab flex-1 ${activeTab === "login" ? "tab-active !bg-[#1a2a5e] !text-white" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </a>
          <a
            role="tab"
            className={`tab flex-1 ${activeTab === "signup" ? "tab-active !bg-[#1a2a5e] !text-white" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </a>
        </div>

        <div className="mt-8 min-h-[380px]">
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>

        <p className="text-center text-sm text-base-content/60 mt-6">
          {activeTab === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                className="link text-primary font-medium"
                onClick={() => setActiveTab("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="link text-primary font-medium"
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
