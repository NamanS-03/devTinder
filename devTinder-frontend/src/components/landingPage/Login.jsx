import { useState } from "react";
import api from "../../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      // TODO: once a logged-in area exists, navigate there.
      console.log(res.data.message);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Welcome back 👋</h2>
      <p className="text-sm text-base-content/60 mt-1">
        Login to find your next dev match
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-right mt-1">
            <a className="link link-hover text-sm text-blue-600">
              Forgot password?
            </a>
          </div>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-app-primary w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="divider text-sm text-base-content/50">or continue with</div>
    </div>
  );
};

export default Login;
