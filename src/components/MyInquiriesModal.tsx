import React, { useState } from 'react';
import { 
  X, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Filter, 
  ShieldCheck, 
  RefreshCw,
  Mail,
  MapPin,
  Tag
} from 'lucide-react';
import type { Inquiry } from '../types';
import type { User } from '../lib/firebase';
import { isUserAdmin, updateInquiryStatus } from '../lib/inquiryService';

interface MyInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries: Inquiry[];
  user: User | null;
  currentLang: 'en' | 'ur';
}

export const MyInquiriesModal: React.FC<MyInquiriesModalProps> = ({
  isOpen,
  onClose,
  inquiries,
  user,
  currentLang,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-review' | 'resolved'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = isUserAdmin(user);
  const isUrdu = currentLang === 'ur';

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  const handleStatusChange = async (inquiryId: string, newStatus: 'pending' | 'in-review' | 'resolved') => {
    try {
      setUpdatingId(inquiryId);
      await updateInquiryStatus(inquiryId, newStatus);
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Review
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pending
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
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">
                  {isAdmin ? 'All Submitted Inquiries (Admin View)' : 'My Inquiries History'}
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-teal-950 text-[10px] font-extrabold uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                {isAdmin
                  ? 'Real-time live incoming messages from fixer-pak customers'
                  : 'Track the status and resolution of your submitted inquiries'}
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
            <span className="font-bold text-slate-600">Filter status:</span>
            <div className="flex items-center gap-1">
              {(['all', 'pending', 'in-review', 'resolved'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                    filter === s
                      ? 'bg-[#0b3b38] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <span className="text-slate-500 font-medium">
            Showing <strong>{filteredInquiries.length}</strong> record{filteredInquiries.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* List Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-bold text-sm">No inquiries found</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                {inquiries.length === 0
                  ? "You haven't submitted any inquiries yet. Submit an inquiry through the contact form to see it here."
                  : 'No inquiries match your current filter.'}
              </p>
            </div>
          ) : (
            filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-teal-700/30 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0b3b38] bg-teal-50 px-2 py-0.5 rounded border border-teal-800/10">
                      #{inq.id}
                    </span>
                    <span className="font-bold text-sm text-slate-800">{inq.subject || inq.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(inq.status)}
                    <span className="text-[11px] text-slate-400">
                      {new Date(inq.createdAt).toLocaleDateString()} {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400">From:</span>
                    <strong className="text-slate-700 truncate">{inq.name}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inq.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{inq.city || 'Pakistan'}</span>
                    <span className="text-slate-300">•</span>
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{inq.category}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {inq.message}
                </p>

                {/* Admin Status Controls */}
                {isAdmin && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-500">Admin quick action:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={updatingId === inq.id || inq.status === 'pending'}
                        onClick={() => handleStatusChange(inq.id, 'pending')}
                        className="px-2.5 py-1 rounded text-[11px] font-bold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-40 cursor-pointer"
                      >
                        Set Pending
                      </button>
                      <button
                        disabled={updatingId === inq.id || inq.status === 'in-review'}
                        onClick={() => handleStatusChange(inq.id, 'in-review')}
                        className="px-2.5 py-1 rounded text-[11px] font-bold border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 disabled:opacity-40 cursor-pointer"
                      >
                        Set In Review
                      </button>
                      <button
                        disabled={updatingId === inq.id || inq.status === 'resolved'}
                        onClick={() => handleStatusChange(inq.id, 'resolved')}
                        className="px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 cursor-pointer"
                      >
                        Set Resolved
                      </button>
                    </div>
                  </div>
                )}
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
