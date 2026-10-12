import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Filter,
  Check,
  Ban
} from 'lucide-react';
import type { Booking } from '../types';
import type { User as FirebaseUser } from '../lib/firebase';
import { updateBookingStatus } from '../lib/bookingService';
import { isUserAdmin } from '../lib/inquiryService';

interface BookingsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  currentUser: FirebaseUser | null;
  currentLang: 'en' | 'ur';
}

export const BookingsTrackerModal: React.FC<BookingsTrackerModalProps> = ({
  isOpen,
  onClose,
  bookings,
  currentUser,
  currentLang,
}) => {
  const [filter, setFilter] = useState<'all' | 'requested' | 'accepted' | 'completed' | 'declined'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = isUserAdmin(currentUser);
  const isUrdu = currentLang === 'ur';

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      setUpdatingId(bookingId);
      await updateBookingStatus(bookingId, newStatus);
    } catch (err) {
      console.error('Failed to update booking status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3 h-3" /> Accepted by Pro
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <Check className="w-3 h-3" /> Job Completed
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <Ban className="w-3 h-3" /> Declined
          </span>
        );
      case 'requested':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Requested
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0b3b38] to-[#134e4a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">
                  {isAdmin ? 'All Service Bookings (Live Admin View)' : 'My Booking Requests'}
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  Firestore Realtime
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                Track appointments and technician status in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-600">Status filter:</span>
            <div className="flex items-center gap-1">
              {(['all', 'requested', 'accepted', 'completed', 'declined'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                    filter === s
                      ? 'bg-[#0b3b38] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <span className="text-slate-500 font-medium">
            Total: <strong>{filteredBookings.length}</strong> booking{filteredBookings.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Bookings List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-bold text-sm">No bookings found</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                {bookings.length === 0
                  ? 'No booking requests have been recorded yet. Select any provider in the directory and click "Book Pro".'
                  : 'No bookings match your selected status filter.'}
              </p>
            </div>
          ) : (
            filteredBookings.map((bk) => (
              <div
                key={bk.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-teal-700/30 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0b3b38] bg-teal-50 px-2 py-0.5 rounded border border-teal-800/10">
                      #{bk.id}
                    </span>
                    <strong className="text-sm text-slate-800">{bk.providerName}</strong>
                    <span className="text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {bk.providerCategory}
                    </span>
                    {bk.isUrgent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        <Zap className="w-3 h-3 fill-amber-600 text-amber-600" /> Urgent
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(bk.status)}
                    <span className="text-[11px] text-slate-400">
                      {new Date(bk.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Customer: <strong className="text-slate-800">{bk.customerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{bk.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{bk.city} ({bk.area || 'City Area'})</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Job Description:
                  </span>
                  <p className="leading-relaxed whitespace-pre-wrap">{bk.jobDetails}</p>
                </div>

                {/* Status action buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Change status:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={updatingId === bk.id || bk.status === 'accepted'}
                      onClick={() => handleStatusChange(bk.id, 'accepted')}
                      className="px-2.5 py-1 rounded text-[11px] font-bold border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 disabled:opacity-40 cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      disabled={updatingId === bk.id || bk.status === 'completed'}
                      onClick={() => handleStatusChange(bk.id, 'completed')}
                      className="px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 cursor-pointer"
                    >
                      Mark Completed
                    </button>
                    <button
                      disabled={updatingId === bk.id || bk.status === 'declined'}
                      onClick={() => handleStatusChange(bk.id, 'declined')}
                      className="px-2.5 py-1 rounded text-[11px] font-bold border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-40 cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
