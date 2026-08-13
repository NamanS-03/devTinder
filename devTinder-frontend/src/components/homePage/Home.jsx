import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeed, sendConnectionRequest } from "../../store/feedSlice";

const MAX_VISIBLE_SKILLS = 5;

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z"
    />
  </svg>
);

const Home = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.feed);
  const [activeIndex, setActiveIndex] = useState(0);
  // Tracks the users array we last reset activeIndex for, so we can bring
  // it back to the first card whenever a fresh feed comes in without doing
  // it in an effect (see https://react.dev/learn/you-might-not-need-an-effect).
  const [prevUsers, setPrevUsers] = useState(users);

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  if (users !== prevUsers) {
    setPrevUsers(users);
    setActiveIndex(0);
  }

  const handleInterested = (toUserId) =>
    dispatch(sendConnectionRequest({ status: "interested", toUserId }));
  const handleIgnored = (toUserId) =>
    dispatch(sendConnectionRequest({ status: "ignored", toUserId }));

  const goPrev = () =>
    setActiveIndex((idx) => (idx - 1 + users.length) % users.length);
  const goNext = () => setActiveIndex((idx) => (idx + 1) % users.length);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#EEF0FB]">
        <span className="loading loading-spinner loading-lg text-[#1a2a5e]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#EEF0FB]">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="h-full flex items-center justify-center bg-[#EEF0FB]">
        <h1 className="text-2xl font-bold text-[#1a2a5e]">
          No new people to show right now 🎉
        </h1>
      </div>
    );
  }

  const user = users[activeIndex];
  const visibleSkills = user.skills?.slice(0, MAX_VISIBLE_SKILLS) || [];
  const hiddenSkillCount = (user.skills?.length || 0) - visibleSkills.length;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-[#EEF0FB] py-10">
      <div className="flex items-center gap-6">
        <button
          className="btn btn-circle bg-white text-[#1a2a5e] border-none shadow hover:bg-[#E9E9FB]"
          onClick={goPrev}
          aria-label="Previous"
        >
          ❮
        </button>

        <div className="card w-[420px] flex-row overflow-hidden rounded-3xl border-t-4 border-[#1a2a5e] bg-white shadow-2xl">
          <div className="flex w-2/5 items-center justify-center bg-[#E9E9FB]">
            {user.profilePicUrl ? (
              <img
                src={user.profilePicUrl}
                alt={user.firstName}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#1a2a5e] text-3xl font-bold text-white ring-4 ring-white">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
          </div>

          <div className="card-body w-3/5 gap-3 p-6">
            <h2 className="text-lg font-bold text-[#1a2a5e]">
              {user.firstName} {user.lastName}
            </h2>
            {(user.age || user.gender) && (
              <p className="text-sm text-gray-400">
                {[user.gender, user.age && `${user.age} yrs`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <p className="text-gray-600">
              {user.bio || "No bio available."}
            </p>
            {!!visibleSkills.length && (
              <div className="flex flex-wrap gap-2">
                {visibleSkills.map((skill) => (
                  <span
                    key={skill}
                    className="badge badge-lg bg-[#E9E9FB] text-[#1a2a5e] border-none capitalize"
                  >
                    {skill}
                  </span>
                ))}
                {hiddenSkillCount > 0 && (
                  <span className="badge badge-lg bg-[#E9E9FB]/60 text-[#1a2a5e]/70 border-none">
                    +{hiddenSkillCount}
                  </span>
                )}
              </div>
            )}

            <div className="card-actions justify-start gap-3 mt-2">
              <button
                className="btn btn-outline btn-sm gap-2 border-[#1a2a5e]/30 text-[#1a2a5e] hover:bg-[#1a2a5e] hover:text-white hover:border-[#1a2a5e]"
                onClick={() => handleIgnored(user._id)}
              >
                <XIcon />
                Pass
              </button>
              <button
                className="btn btn-sm gap-2 text-white bg-[#1a2a5e] border-none hover:bg-[#12204a]"
                onClick={() => handleInterested(user._id)}
              >
                <HeartIcon />
                Connect
              </button>
            </div>
          </div>
        </div>

        <button
          className="btn btn-circle bg-white text-[#1a2a5e] border-none shadow hover:bg-[#E9E9FB]"
          onClick={goNext}
          aria-label="Next"
        >
          ❯
        </button>
      </div>

      <p className="text-[#1a2a5e]/60 text-sm font-medium">
        {activeIndex + 1} of {users.length} devs
      </p>
      <div className="flex gap-2">
        {users.map((u, idx) => (
          <button
            key={u._id}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${
              idx === activeIndex ? "w-6 bg-[#1a2a5e]" : "w-2 bg-[#1a2a5e]/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
