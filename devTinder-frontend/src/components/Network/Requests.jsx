import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReceivedRequests, acknowledgeRequest } from "../../store/requestSlice";

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

// The backend doesn't expose an endpoint for the requests the logged-in user
// has sent out yet, so this section renders with an empty/pending state for
// now. Once a GET /user/sentRequests-style endpoint exists this can be wired
// up the same way the received-requests list is.
const sentRequests = [];

const Requests = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchReceivedRequests());
  }, [dispatch]);

  const handleAccept = (requestId) =>
    dispatch(acknowledgeRequest({ status: "accepted", requestId }));
  const handleReject = (requestId) =>
    dispatch(acknowledgeRequest({ status: "rejected", requestId }));

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-[#1a2a5e]">Requests</h1>

      {/* Received requests */}
      <section className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-[#1a2a5e]">Received</h2>
          {!!requests.length && (
            <span className="badge badge-sm bg-[#1a2a5e] text-white border-none">
              {requests.length}
            </span>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <span className="loading loading-spinner loading-lg text-[#1a2a5e]"></span>
          </div>
        )}

        {!loading && error && <p className="text-error">{error}</p>}

        {!loading && !error && !requests.length && (
          <p className="text-base-content/60">No pending connection requests.</p>
        )}

        {!loading && !error && !!requests.length && (
          <div className="flex flex-col gap-4">
            {requests.map((request) => {
              const fromUser = request.fromUserId;
              return (
                <div
                  key={request._id}
                  className="card w-full flex-row items-center justify-between rounded-2xl border border-base-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2a5e] text-lg font-bold text-white">
                      {getInitials(fromUser?.firstName, fromUser?.lastName)}
                    </div>
                    <p className="font-semibold text-[#1a2a5e]">
                      {fromUser?.firstName} {fromUser?.lastName}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="btn btn-sm text-white bg-[#1a2a5e] border-none hover:bg-[#12204a]"
                      onClick={() => handleAccept(request._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-outline btn-sm border-error/40 text-error hover:bg-error hover:text-white hover:border-error"
                      onClick={() => handleReject(request._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sent requests */}
      <section className="mt-10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-[#1a2a5e]">Sent</h2>
          {!!sentRequests.length && (
            <span className="badge badge-sm bg-warning text-warning-content border-none">
              {sentRequests.length} pending
            </span>
          )}
        </div>

        {!sentRequests.length ? (
          <p className="text-base-content/60">
            You haven't sent any connection requests yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {sentRequests.map((request) => {
              const toUser = request.toUserId;
              return (
                <div
                  key={request._id}
                  className="card w-full flex-row items-center justify-between rounded-2xl border border-base-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2a5e] text-lg font-bold text-white">
                      {getInitials(toUser?.firstName, toUser?.lastName)}
                    </div>
                    <p className="font-semibold text-[#1a2a5e]">
                      {toUser?.firstName} {toUser?.lastName}
                    </p>
                  </div>
                  <span className="badge badge-sm bg-warning/20 text-warning-content border-none">
                    Pending
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Requests;
