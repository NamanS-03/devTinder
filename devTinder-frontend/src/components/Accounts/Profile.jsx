import { useEffect, useState } from "react";
import api from "../../utils/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/view");
        setUser(res.data?.data || null);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-[#1a2a5e]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { firstName, lastName, email, bio, age, gender, profilePicUrl, skills } = user;
  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="rounded-box bg-gradient-to-b from-white to-[#f4f4fc] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            {profilePicUrl ? (
              <div className="avatar">
                <div className="w-24 rounded-full">
                  <img src={profilePicUrl} alt={`${firstName} ${lastName}`} />
                </div>
              </div>
            ) : (
              <div className="avatar placeholder">
                <div className="w-24 rounded-full bg-[#E9E9FB] text-[#1a2a5e]">
                  <span className="text-3xl font-medium">{initials}</span>
                </div>
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-[#1a2a5e]">
                {firstName} {lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-base-content/60 text-sm">
                {gender && <span className="capitalize">{gender}</span>}
                {age && <span>{age} years old</span>}
                <span className="flex items-center gap-1">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {email}
                </span>
              </div>
            </div>
          </div>

          <button className="btn text-white bg-[#1a2a5e] border-none hover:bg-[#12204a] self-start sm:self-auto">
            Edit profile
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Skills */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold text-[#1a2a5e]">Skills</h2>
            {skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge badge-lg bg-[#E9E9FB] text-[#1a2a5e] border-none capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 mt-2">
                No skills added yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="text-lg font-bold text-[#1a2a5e]">About me</h2>
              <p className="text-base-content/70 mt-2">
                {bio || "Use this space to tell people about yourself."}
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="text-lg font-bold text-[#1a2a5e]">Details</h2>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-base-content/60">Email</span>
                  <span>{email}</span>
                </li>
                {age && (
                  <li className="flex justify-between">
                    <span className="text-base-content/60">Age</span>
                    <span>{age}</span>
                  </li>
                )}
                {gender && (
                  <li className="flex justify-between">
                    <span className="text-base-content/60">Gender</span>
                    <span className="capitalize">{gender}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
