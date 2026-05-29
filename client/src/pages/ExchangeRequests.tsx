import { useState, useEffect } from 'react';
import { requestApi } from '../services/api';
import { PageLayout } from '../components/PageLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import {
  FiInbox, FiSend, FiCheck, FiX, FiRefreshCw, FiMessageSquare,
  FiInfo, FiArrowRight, FiZap, FiShield, FiClock, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  trustScore?: number;
  role?: string;
}

interface RewardInfo {
  _id: string;
  title: string;
  points: number;
  description?: string;
  image_url?: string;
}

interface ExchangeRequestData {
  _id: string;
  reward: RewardInfo;
  sender: UserInfo;
  receiver: UserInfo;
  offeredReward?: RewardInfo;
  offeredPoints?: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

export const ExchangeRequests = () => {
  const [sentRequests, setSentRequests] = useState<ExchangeRequestData[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ExchangeRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestApi.getMyRequests();
      const data = response.data || { sent: [], received: [] };
      setSentRequests(Array.isArray(data.sent) ? data.sent : []);
      setReceivedRequests(Array.isArray(data.received) ? data.received : []);
    } catch (err: any) {
      console.error('Failed to fetch requests:', err);
      toast.error(err.response?.data?.message || 'Failed to load exchange requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      setActioningId(requestId);
      await requestApi.respond(requestId, status);
      toast.success(status === 'accepted' ? '🎉 Exchange request accepted!' : 'Exchange request rejected');
      await fetchRequests();
    } catch (err: any) {
      console.error('Failed to respond to request:', err);
      toast.error(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            <FiClock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            <FiCheck className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400">
            <FiX className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <FiX className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const activeRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <PageLayout title="Exchange Swaps">
      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8 max-w-md">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'received'
              ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiInbox className="w-4 h-4" />
          Received
          {receivedRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] bg-red-500 text-white font-bold animate-pulse">
              {receivedRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'sent'
              ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiSend className="w-4 h-4" />
          Sent
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : activeRequests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 border border-gray-100 dark:border-gray-700/50 shadow-md text-center">
          <FiInbox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No exchange requests found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'received'
              ? "You haven't received any exchange offers yet."
              : "You haven't proposed any swaps to other users yet."}
          </p>
          <button
            onClick={fetchRequests}
            className="mt-6 flex items-center gap-2 mx-auto px-4 py-2 text-xs font-bold bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl transition-all"
          >
            <FiRefreshCw /> Refresh List
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {activeRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((req) => {
              const hasOfferedReward = !!req.offeredReward;
              const hasOfferedPoints = (req.offeredPoints ?? 0) > 0;
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req._id}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-md transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                >
                  {/* Header info */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">
                        {(activeTab === 'received' ? req.sender.name : req.receiver.name)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {activeTab === 'received' ? 'Proposed by' : 'Requested from'}
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                          {activeTab === 'received' ? req.sender.name : req.receiver.name}
                          {(activeTab === 'received' ? req.sender.trustScore : req.receiver.trustScore) !== undefined && (
                            <span className="flex items-center gap-0.5 text-[10px] text-cyan-500 font-bold bg-cyan-50 dark:bg-cyan-900/20 px-1.5 py-0.5 rounded">
                              <FiShield className="w-3 h-3" />
                              {activeTab === 'received' ? req.sender.trustScore : req.receiver.trustScore}% Trust
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-[10px] text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Swapping detail panel */}
                  <div className="grid md:grid-cols-7 items-center gap-4 bg-gray-50/50 dark:bg-gray-900/20 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-700/30 mb-4">
                    {/* Left Side: Offered Item */}
                    <div className="md:col-span-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                        {activeTab === 'received' ? "Sender Offers" : "You Propose Offering"}
                      </p>
                      
                      {hasOfferedReward ? (
                        <div className="flex items-center gap-3">
                          {req.offeredReward?.image_url ? (
                            <img
                              src={req.offeredReward.image_url}
                              alt={req.offeredReward.title}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                              Gift
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
                              {req.offeredReward?.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Worth {req.offeredReward?.points} pts
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500 italic">No physical item</p>
                      )}

                      {hasOfferedPoints && (
                        <div className="mt-2.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg w-max">
                          <FiZap className="w-3.5 h-3.5 fill-current" />
                          + {req.offeredPoints} Point Offset
                        </div>
                      )}
                    </div>

                    {/* Middle Arrow */}
                    <div className="md:col-span-1 flex justify-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                        <FiArrowRight className="w-4 h-4 md:rotate-0 rotate-90" />
                      </div>
                    </div>

                    {/* Right Side: Requested Item */}
                    <div className="md:col-span-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                        {activeTab === 'received' ? "In Exchange For Your" : "In Exchange For"}
                      </p>

                      <div className="flex items-center gap-3">
                        {req.reward?.image_url ? (
                          <img
                            src={req.reward.image_url}
                            alt={req.reward.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            Gift
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
                            {req.reward?.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Worth {req.reward?.points} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Offer Message */}
                  {req.message && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl text-xs text-gray-600 dark:text-gray-300 mb-4 border border-gray-100/50 dark:border-gray-700/20">
                      <FiMessageSquare className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-400 text-[10px] uppercase mb-0.5">Message</p>
                        <p className="italic">"{req.message}"</p>
                      </div>
                    </div>
                  )}

                  {/* User Info & Action Controls */}
                  {isPending && activeTab === 'received' && (
                    <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                      <button
                        onClick={() => handleRespond(req._id, 'rejected')}
                        disabled={actioningId !== null}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                      >
                        <FiX /> Reject Swap
                      </button>
                      <button
                        onClick={() => handleRespond(req._id, 'accepted')}
                        disabled={actioningId !== null}
                        className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {actioningId === req._id ? (
                          <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FiCheck />
                        )}
                        Accept Swap
                      </button>
                    </div>
                  )}

                  {isPending && activeTab === 'sent' && (
                    <div className="flex items-center gap-2.5 p-3 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100/50 dark:border-cyan-800/30 rounded-2xl text-[11px] text-cyan-600 dark:text-cyan-400 mt-4">
                      <FiInfo className="w-4 h-4 flex-shrink-0" />
                      <span>Waiting for {req.receiver.name} to review your proposal.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {activeRequests.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700/60 pt-6 mt-8">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-800 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {Math.min(currentPage * itemsPerPage, activeRequests.length)}
                </span>{' '}
                of <span className="font-semibold text-gray-800 dark:text-white">{activeRequests.length}</span> swaps
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(p - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.ceil(activeRequests.length / itemsPerPage) }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                      currentPage === pageNum
                        ? 'bg-cyan-500 border-transparent text-white shadow-md shadow-cyan-500/20'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(p + 1, Math.ceil(activeRequests.length / itemsPerPage)));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === Math.ceil(activeRequests.length / itemsPerPage)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      )}
    </PageLayout>
  );
};
