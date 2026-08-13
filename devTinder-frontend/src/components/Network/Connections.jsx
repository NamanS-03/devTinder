import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyConnections } from "../../store/connectionSlice";

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

const Connections = () => {
  const dispatch = useDispatch();
  const { connections, loading, error } = useSelector(
    (state) => state.connections
  );

  useEffect(() => {
    dispatch(fetchMyConnections());
  }, [dispatch]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Connections</h1>

      {loading && (
        <div className="mt-6 flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {!loading && error && <p className="text-error mt-6">{error}</p>}

      {!loading && !error && !connections.length && (
        <p className="text-gray-500 mt-6">No connections yet.</p>
      )}

      {!loading && !error && !!connections.length && (
        <div className="mt-6 flex flex-col gap-4">
          {connections.map((connection) => (
            <div
              key={connection._id}
              className="card w-full max-w-xl flex-row items-center gap-4 rounded-2xl bg-base-200 p-4 shadow"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-900 text-lg font-bold text-white">
                {getInitials(connection.firstName, connection.lastName)}
              </div>
              <p className="font-semibold">
                {connection.firstName} {connection.lastName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;
