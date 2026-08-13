import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReceivedRequests } from "../../store/requestSlice";

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

const Requests = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchReceivedRequests());
  }, [dispatch]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Requests</h1>

      {loading && (
        <div className="mt-6 flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {!loading && error && <p className="text-error mt-6">{error}</p>}

      {!loading && !error && !requests.length && (
        <p className="text-gray-500 mt-6">No pending connection requests.</p>
      )}

      {!loading && !error && !!requests.length && (
        <div className="mt-6 flex flex-col gap-4">
          {requests.map((request) => {
            const fromUser = request.fromUserId;
            return (
              <div
                key={request._id}
                className="card w-full max-w-xl flex-row items-center justify-between rounded-2xl bg-base-200 p-4 shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-900 text-lg font-bold text-white">
                    {getInitials(fromUser?.firstName, fromUser?.lastName)}
                  </div>
                  <p className="font-semibold">
                    {fromUser?.firstName} {fromUser?.lastName}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="btn btn-success btn-sm" disabled>
                    Accept
                  </button>
                  <button className="btn btn-error btn-outline btn-sm" disabled>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;
