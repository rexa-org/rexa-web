import { useState, useEffect } from 'react';
import { transactionApi } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { FiGift, FiClock, FiUser, FiHash, FiAward, FiSun, FiRefreshCw, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface Transaction {
    _id: string;
    fromUser?: { _id: string; name: string; email: string };
    toUser?: { _id: string; name: string; email: string };
    points: number;
    reward?: { 
        _id: string; 
        title: string; 
        points: number;
        description: string;
        code: string;
    };
    type: 'redemption' | 'exchange' | 'checkin' | 'signup_bonus' | 'admin_adjustment';
    createdAt: string;
}

export const TransactionHistory = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await transactionApi.getHistory();
                setTransactions(response.data || []);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
                setError('Failed to load transactions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'redemption': return <FiGift className="w-5 h-5 text-purple-500" />;
            case 'exchange': return <FiRefreshCw className="w-5 h-5 text-blue-500 animate-spin-slow" />;
            case 'checkin': return <FiSun className="w-5 h-5 text-amber-500" />;
            case 'signup_bonus': return <FiAward className="w-5 h-5 text-emerald-500" />;
            case 'admin_adjustment': return <FiSliders className="w-5 h-5 text-red-500" />;
            default: return <FiClock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'redemption': return 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/30';
            case 'exchange': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30';
            case 'checkin': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30';
            case 'signup_bonus': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30';
            case 'admin_adjustment': return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30';
            default: return 'bg-gray-50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800/30';
        }
    };

    const isCredit = (tx: Transaction) => {
        return tx.toUser?._id === user?._id;
    };

    return (
        <div className="space-y-6 min-h-screen px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        Transaction History
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        View and filter all your point movement records
                    </p>
                </div>

                {/* Items per page Selector */}
                {transactions.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                        >
                            <option value={5}>5</option>
                            <option value={8}>8</option>
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                        </select>
                        <span>entries</span>
                    </div>
                )}
            </div>
        
            <div className="space-y-4">
                {currentTransactions.length > 0 ? (
                    currentTransactions.map((transaction) => {
                        const credit = isCredit(transaction);
                        return (
                            <div
                                key={transaction._id}
                                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden hover:shadow-md transition-all duration-300`}
                            >
                                {/* Header */}
                                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/40 flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <FiClock className="text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            {format(new Date(transaction.createdAt), 'MMM d, yyyy • h:mm a')}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                        transaction.type === 'redemption' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                        transaction.type === 'exchange' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        transaction.type === 'checkin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        transaction.type === 'signup_bonus' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {transaction.type.replace('_', ' ')}
                                    </span>
                                </div>
            
                                {/* Body */}
                                <div className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3.5 rounded-xl border flex-shrink-0 ${getBgColor(transaction.type)}`}>
                                                {getTypeIcon(transaction.type)}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                                                    {transaction.reward ? transaction.reward.title : `${transaction.type.replace('_', ' ')} Entry`}
                                                </h3>
                                                {transaction.reward?.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                                                        {transaction.reward.description}
                                                    </p>
                                                )}
                                                
                                                {/* Code Section if redemption and owner/recipient matches */}
                                                {transaction.reward?.code && (
                                                    <div className="mt-2.5 flex items-center space-x-2 text-xs">
                                                        <FiHash className="text-cyan-500" />
                                                        <span className="text-gray-400">Voucher Code:</span>
                                                        <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono font-bold text-cyan-600 dark:text-cyan-400 select-all">
                                                            {transaction.reward.code}
                                                        </code>
                                                    </div>
                                                )}
            
                                                {/* Directional info */}
                                                {(transaction.fromUser || transaction.toUser) && (
                                                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                                                        <FiUser />
                                                        <span>
                                                            {transaction.fromUser ? (
                                                                <>From <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                                    {transaction.fromUser._id === user?._id ? 'You' : transaction.fromUser.name}
                                                                </span></>
                                                            ) : null}
                                                            {transaction.toUser ? (
                                                                <> to <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                                    {transaction.toUser._id === user?._id ? 'You' : transaction.toUser.name}
                                                                </span></>
                                                            ) : null}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Points display */}
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-lg font-black tracking-tight ${
                                                credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                                            }`}>
                                                {credit ? '+' : '-'}{Math.abs(transaction.points)} pts
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">
                                                Transaction Value
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-12 text-center shadow-sm">
                        <FiClock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <h4 className="font-bold text-gray-800 dark:text-white text-lg">No transactions found</h4>
                        <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                            No ledger details available. Acquire points via check-ins, or exchange vouchers to see details.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700/60 pt-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-800 dark:text-white">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-semibold text-gray-800 dark:text-white">
                            {Math.min(indexOfLastItem, transactions.length)}
                        </span>{' '}
                        of <span className="font-semibold text-gray-800 dark:text-white">{transactions.length}</span> entries
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                            title="Previous Page"
                        >
                            <FiChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
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
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                            title="Next Page"
                        >
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};