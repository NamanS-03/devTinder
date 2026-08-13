import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeed, sendConnectionRequest } from "../../store/feedSlice";

const MAX_VISIBLE_SKILLS = 5;

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

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
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <h1 className="text-2xl font-bold text-white">
          No new people to show right now 🎉
        </h1>
      </div>
    );
  }

  const user = users[activeIndex];
  const visibleSkills = user.skills?.slice(0, MAX_VISIBLE_SKILLS) || [];
  const hiddenSkillCount = (user.skills?.length || 0) - visibleSkills.length;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-neutral-900 py-10">
      <div className="flex items-center gap-6">
        <button
          className="btn btn-circle bg-white text-neutral-900 border-none hover:bg-gray-200"
          onClick={goPrev}
          aria-label="Previous"
        >
          ❮
        </button>

        <div className="card w-[420px] flex-row overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex w-2/5 items-center justify-center bg-indigo-100">
            {user.profilePicUrl ? (
              <img
                src={user.profilePicUrl}
                alt={user.firstName}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-indigo-900 text-3xl font-bold text-white ring-4 ring-white">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
          </div>

          <div className="card-body w-3/5 gap-3 p-6">
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
                    className="badge badge-lg bg-gray-100 text-gray-700 border-none"
                  >
                    {skill}
                  </span>
                ))}
                {hiddenSkillCount > 0 && (
                  <span className="badge badge-lg bg-gray-200 text-gray-600 border-none">
                    +{hiddenSkillCount}
                  </span>
                )}
              </div>
            )}

            <div className="card-actions justify-start gap-3 mt-2">
              <button
                className="btn btn-error btn-outline btn-sm"
                onClick={() => handleIgnored(user._id)}
              >
                Ignore
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleInterested(user._id)}
              >
                Interested
              </button>
            </div>
          </div>
        </div>

        <button
          className="btn btn-circle bg-white text-neutral-900 border-none hover:bg-gray-200"
          onClick={goNext}
          aria-label="Next"
        >
          ❯
        </button>
      </div>

      <p className="text-gray-300">
        {activeIndex + 1} of {users.length} devs
      </p>
      <div className="flex gap-2">
        {users.map((u, idx) => (
          <button
            key={u._id}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${
              idx === activeIndex ? "w-6 bg-indigo-500" : "w-2 bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
