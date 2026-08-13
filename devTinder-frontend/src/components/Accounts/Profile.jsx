import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../utils/api";
import { setUser as setUserInStore } from "../../store/authSlice";
import { fetchMyConnections } from "../../store/connectionSlice";
import { fetchReceivedRequests } from "../../store/requestSlice";

const PROFILE_FIELDS_FOR_COMPLETION = [
  "bio",
  "age",
  "gender",
  "profilePicUrl",
  "skills",
];

const computeProfileCompletion = (user) => {
  if (!user) return 0;
  const filled = PROFILE_FIELDS_FOR_COMPLETION.filter((field) => {
    const value = user[field];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }).length;
  return Math.round((filled / PROFILE_FIELDS_FOR_COMPLETION.length) * 100);
};

const PencilIcon = ({ className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const buildFormState = (user) => ({
  bio: user?.bio || "",
  age: user?.age ?? "",
  gender: user?.gender || "",
  profilePicUrl: user?.profilePicUrl || "",
  skills: user?.skills || [],
});

const Profile = () => {
  const dispatch = useDispatch();
  const { connections } = useSelector((state) => state.connections);
  const { requests } = useSelector((state) => state.requests);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [picUploadError, setPicUploadError] = useState("");
  const [formData, setFormData] = useState(buildFormState(null));
  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/view");
        const fetchedUser = res.data?.data || null;
        setUser(fetchedUser);
        dispatch(setUserInStore(fetchedUser));
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    dispatch(fetchMyConnections());
    dispatch(fetchReceivedRequests());
  }, [dispatch]);

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

  const original = buildFormState(user);
  const isDirty =
    isEditing &&
    (formData.bio !== original.bio ||
      String(formData.age) !== String(original.age) ||
      formData.gender !== original.gender ||
      formData.profilePicUrl !== original.profilePicUrl ||
      JSON.stringify(formData.skills) !== JSON.stringify(original.skills));

  const startEditing = () => {
    setFormData(buildFormState(user));
    setSkillsInput("");
    setSaveError("");
    setPicUploadError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormData(buildFormState(user));
    setSkillsInput("");
    setSaveError("");
    setPicUploadError("");
    setIsEditing(false);
  };

  const handleFieldChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Downscales the image and re-encodes it as JPEG so the resulting
  // base64 string stays well under the request body size limit.
  const resizeImage = (file, maxDimension = 250, quality = 0.6) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read-failed"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("decode-failed"));
        img.onload = () => {
          const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPicUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPicUploadError("Image must be smaller than 10MB.");
      return;
    }

    setPicUploadError("");
    try {
      const dataUrl = await resizeImage(file);
      // Guard against the resulting base64 string still being too large for
      // the request body limit (e.g. very busy/high-detail source images).
      const MAX_DATA_URL_LENGTH = 6 * 1024 * 1024; // ~6MB, keeps headroom under the 8mb server limit
      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        setPicUploadError("This image is too large even after compression. Please choose a smaller or simpler image.");
        return;
      }
      setFormData((prev) => ({ ...prev, profilePicUrl: dataUrl }));
    } catch {
      setPicUploadError("Failed to read the selected image. Please try again.");
    }
  };

  const addSkill = () => {
    const value = skillsInput.trim();
    if (value && !formData.skills.includes(value)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, value] }));
    }
    setSkillsInput("");
  };

  const handleSkillsKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        bio: formData.bio,
        gender: formData.gender,
        profilePicUrl: formData.profilePicUrl,
        skills: formData.skills,
      };
      if (formData.age !== "") {
        payload.age = Number(formData.age);
      }
      const res = await api.patch("/profile/updateProfile", payload);
      const updatedUser = res.data?.data || { ...user, ...payload };
      setUser(updatedUser);
      dispatch(setUserInStore(updatedUser));
      setIsEditing(false);
    } catch (err) {
      setSaveError(
        err?.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const profileCompletion = computeProfileCompletion(user);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Banner + avatar */}
      <div className="rounded-box overflow-visible">
        <div className="h-32 sm:h-40 rounded-box bg-gradient-to-r from-[#1a2a5e] via-[#2c3f8c] to-[#4a5cc4]" />

        <div className="px-4 sm:px-8 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="flex items-end gap-5">
              <div className="relative">
                {(isEditing ? formData.profilePicUrl : profilePicUrl) ? (
                  <div className="avatar">
                    <div className="w-28 sm:w-32 rounded-full ring-4 ring-white">
                      <img
                        src={isEditing ? formData.profilePicUrl : profilePicUrl}
                        alt={`${firstName} ${lastName}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="w-28 sm:w-32 rounded-full bg-[#E9E9FB] text-[#1a2a5e] ring-4 ring-white">
                      <span className="text-3xl font-medium">{initials}</span>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <label
                    htmlFor="profilePicInput"
                    className="absolute bottom-1 right-1 flex items-center justify-center w-8 h-8 rounded-full bg-[#1a2a5e] text-white border-2 border-white cursor-pointer hover:bg-[#12204a]"
                    title="Change profile picture"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <input
                      id="profilePicInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicChange}
                    />
                  </label>
                )}
              </div>

              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2a5e]">
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

            {!isEditing ? (
              <button
                className="btn text-white bg-[#1a2a5e] border-none hover:bg-[#12204a] self-start sm:self-auto"
                onClick={startEditing}
              >
                Edit profile
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2 self-start sm:self-auto">
                {isDirty && (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm text-white bg-[#1a2a5e] border-none hover:bg-[#12204a]"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {!isDirty && (
                  <button className="btn btn-sm btn-ghost" onClick={cancelEditing}>
                    Done editing
                  </button>
                )}
                {saveError && <p className="text-error text-sm">{saveError}</p>}
              </div>
            )}
          </div>

          {isEditing && picUploadError && (
            <div className="mt-4">
              <p className="text-error text-sm">{picUploadError}</p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 max-w-md">
            <div className="rounded-xl border border-base-200 bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-xl font-bold text-[#1a2a5e]">{connections.length}</p>
              <p className="text-xs text-base-content/60 mt-0.5">Connections</p>
            </div>
            <div className="rounded-xl border border-base-200 bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-xl font-bold text-[#1a2a5e]">{requests.length}</p>
              <p className="text-xs text-base-content/60 mt-0.5">Requests</p>
            </div>
            <div className="rounded-xl border border-base-200 bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-xl font-bold text-[#1a2a5e]">{profileCompletion}%</p>
              <p className="text-xs text-base-content/60 mt-0.5">Profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Skills */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1a2a5e]">Skills</h2>
              {isEditing && <PencilIcon className="h-4 w-4 text-[#1a2a5e]/60" />}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="badge badge-lg bg-[#E9E9FB] text-[#1a2a5e] border-none capitalize gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        className="ml-1"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full max-w-xs mt-3"
                  placeholder="Add a skill and press Enter"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleSkillsKeyDown}
                  onBlur={addSkill}
                />
              </div>
            ) : skills?.length > 0 ? (
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
              <button
                type="button"
                className="mt-2 w-full rounded-xl border-2 border-dashed border-[#1a2a5e]/25 py-6 text-sm text-[#1a2a5e]/60 hover:border-[#1a2a5e]/50 hover:text-[#1a2a5e] transition-colors"
                onClick={startEditing}
              >
                + Add skills to showcase what you work with
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1a2a5e]">About me</h2>
                {isEditing && <PencilIcon className="h-4 w-4 text-[#1a2a5e]/60" />}
              </div>
              {isEditing ? (
                <textarea
                  className="textarea textarea-bordered w-full mt-2"
                  rows={4}
                  value={formData.bio}
                  onChange={handleFieldChange("bio")}
                  placeholder="Use this space to tell people about yourself."
                />
              ) : (
                <p className="text-base-content/70 mt-2">
                  {bio || "Use this space to tell people about yourself."}
                </p>
              )}
            </div>
          </div>

          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1a2a5e]">Details</h2>
                {isEditing && <PencilIcon className="h-4 w-4 text-[#1a2a5e]/60" />}
              </div>
              {isEditing ? (
                <div className="mt-2 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60">Email</span>
                    <span>{email}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-base-content/60">Age</span>
                    <input
                      type="number"
                      className="input input-sm input-bordered w-24 text-right"
                      value={formData.age}
                      onChange={handleFieldChange("age")}
                      min="18"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-base-content/60">Gender</span>
                    <select
                      className="select select-sm select-bordered w-32"
                      value={formData.gender}
                      onChange={handleFieldChange("gender")}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
