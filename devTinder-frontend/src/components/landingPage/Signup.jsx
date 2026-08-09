const Signup = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold">Create your account 🚀</h2>
      <p className="text-sm text-base-content/60 mt-1">
        Sign up to find developers who match your vibe
      </p>

      <form className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal">Full name</label>
          <input
            type="text"
            placeholder="Jane Doe"
            className="input input-bordered w-full rounded-md"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full rounded-md"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full rounded-md"
          />
        </div>

        <button
          type="submit"
          className="btn w-full rounded-md !bg-[#1a2a5e] !text-white border-none"
        >
          Sign Up
        </button>
      </form>

      <div className="divider text-sm text-base-content/50">or continue with</div>
    </div>
  );
};

export default Signup;
