import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../store/authSlice";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { signupLoading, signupError, signupSuccess } = useSelector(
    (state) => state.auth
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signupUser({ firstName, lastName, email, password }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Create your account 🚀</h2>
      <p className="text-sm text-base-content/60 mt-1">
        Sign up to find developers who match your vibe
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-normal">First name</label>
            <input
              type="text"
              placeholder="Jane"
              className="input input-bordered w-full rounded-md"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-normal">Last name</label>
            <input
              type="text"
              placeholder="Doe"
              className="input input-bordered w-full rounded-md"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

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
        </div>

        {signupError && <p className="text-sm text-error">{signupError}</p>}
        {signupSuccess && <p className="text-sm text-success">{signupSuccess}</p>}

        <button
          type="submit"
          className="btn btn-app-primary w-full"
          disabled={signupLoading}
        >
          {signupLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="divider text-sm text-base-content/50">or continue with</div>
    </div>
  );
};

export default Signup;
