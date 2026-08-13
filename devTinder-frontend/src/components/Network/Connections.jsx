import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyConnections } from "../../store/connectionSlice";

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-base-content/40"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
    />
  </svg>
);

const Connections = () => {
  const dispatch = useDispatch();
  const { connections, loading, error } = useSelector(
    (state) => state.connections
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchMyConnections());
  }, [dispatch]);

  const filteredConnections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return connections;
    return connections.filter((connection) => {
      const name = `${connection.firstName} ${connection.lastName}`.toLowerCase();
      const skillMatch = connection.skills?.some((skill) =>
        skill.toLowerCase().includes(query)
      );
      return name.includes(query) || skillMatch;
    });
  }, [connections, search]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2a5e]">Connections</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {connections.length}{" "}
            {connections.length === 1 ? "connection" : "connections"}
          </p>
        </div>

        {!!connections.length && (
          <label className="input input-bordered flex items-center gap-2 w-full sm:w-72 bg-white">
            <SearchIcon />
            <input
              type="text"
              className="grow"
              placeholder="Search by name or skill"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        )}
      </div>

      {loading && (
        <div className="mt-10 flex justify-center">
          <span className="loading loading-spinner loading-lg text-[#1a2a5e]"></span>
        </div>
      )}

      {!loading && error && <p className="text-error mt-6">{error}</p>}

      {!loading && !error && !connections.length && (
        <p className="text-base-content/60 mt-6">No connections yet.</p>
      )}

      {!loading && !error && !!connections.length && !filteredConnections.length && (
        <p className="text-base-content/60 mt-6">
          No connections match "{search}".
        </p>
      )}

      {!loading && !error && !!filteredConnections.length && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredConnections.map((connection) => (
            <div
              key={connection._id}
              className="card rounded-2xl border border-base-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {connection.profilePicUrl ? (
                  <img
                    src={connection.profilePicUrl}
                    alt={connection.firstName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1a2a5e] text-lg font-bold text-white">
                    {getInitials(connection.firstName, connection.lastName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[#1a2a5e] truncate">
                    {connection.firstName} {connection.lastName}
                  </p>
                  {(connection.role || connection.city) && (
                    <p className="text-xs text-base-content/60 truncate">
                      {[connection.role, connection.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              {!!connection.skills?.length && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {connection.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="badge badge-sm bg-[#E9E9FB] text-[#1a2a5e] border-none capitalize"
                    >
                      {skill}
                    </span>
                  ))}
                  {connection.skills.length > 4 && (
                    <span className="badge badge-sm bg-[#E9E9FB]/60 text-[#1a2a5e]/70 border-none">
                      +{connection.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button className="btn btn-sm flex-1 text-white bg-[#1a2a5e] border-none hover:bg-[#12204a]">
                  Message
                </button>
                <button className="btn btn-sm btn-outline flex-1 border-error/40 text-error hover:bg-error hover:text-white hover:border-error">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;
