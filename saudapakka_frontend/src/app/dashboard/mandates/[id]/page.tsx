"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { mandateService } from "@/services/mandateService";
import { Mandate, MandateStatus } from "@/types/mandate";
import { parseMandateTemplate } from "@/utils/mandateTemplateParser";
import MandateLetter from "@/components/mandates/MandateLetter";
import SignaturePad from "@/components/mandates/SignaturePad";
import { Loader2, AlertTriangle, CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function MandateDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as string; // Treat as string (could be UUID)

    const [mandate, setMandate] = useState<Mandate | null>(null);
    const [propertyDetails, setPropertyDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Action States
    const [showSignModal, setShowSignModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [signature, setSignature] = useState<File | null>(null);
    const [isAgreed, setIsAgreed] = useState(false);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            fetchMandate();
        } else {
            console.error("No ID provided");
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setScrolledToBottom(true);
                }
            },
            { threshold: 1.0 }
        );

        if (scrollRef.current) {
            observer.observe(scrollRef.current);
        }

        return () => observer.disconnect();
    }, [loading, mandate]); // Re-attach when content loads

    const fetchMandate = async () => {
        try {
            const data = await mandateService.getMandateById(id);
            setMandate(data);
            // Fetch property details for the template
            if (data.property_item) {
                try {
                    const propRes = await axios.get(`/api/properties/${data.property_item}/`);
                    setPropertyDetails(propRes.data);
                } catch (e) { console.error("Could not fetch property details", e); }
            }
        } catch (err) {
            console.error("Failed to load mandate", err);
        } finally {
            setLoading(false);
        }
    };

    const handeAccept = async () => {
        if (!signature || !mandate) return;
        setActionLoading(true);
        try {
            await mandateService.acceptAndSign(mandate.id, signature);
            setShowSignModal(false);
            fetchMandate(); // Refresh to see Active status
            alert("Mandate Activated Successfully!");
        } catch (err: any) {
            console.error("Failed to accept", err);
            const msg = err.response?.data?.message || "Failed to accept mandate. Please try again.";
            alert(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason || !mandate) return;
        setActionLoading(true);
        try {
            await mandateService.rejectMandate(mandate.id, { reason: rejectReason });
            setShowRejectModal(false);
            fetchMandate();
        } catch (err) {
            console.error("Failed to reject", err);
            alert("Failed to reject mandate.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRenew = async () => {
        if (!mandate) return;
        setActionLoading(true);
        try {
            await mandateService.renewMandate(mandate.id);
            alert("Mandate renewal initiated! A new request has been created.");
            router.push('/dashboard/mandates');
        } catch (err) {
            console.error("Failed to renew", err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-green w-8 h-8" /></div>;
    if (!mandate) return <div className="p-8 text-center text-gray-500">Mandate not found or invalid ID.</div>;

    const isPending = mandate.status === MandateStatus.PENDING;
    const isExpired = mandate.status === MandateStatus.EXPIRED;
    const isRejected = mandate.status === MandateStatus.REJECTED;
    const isActive = mandate.status === MandateStatus.ACTIVE;

    // Check Expiry Warning (15 days)
    const isExpiringSoon = isActive && mandate.expiry_date && (() => {
        const today = new Date();
        const expiry = new Date(mandate.expiry_date);
        const diffTime = Math.abs(expiry.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 15 && expiry > today;
    })();

    const isTerminatedByUser = mandate.status === 'TERMINATED_BY_USER';

    const handleCancel = async () => {
        if (!mandate) return;
        if (!confirm("Are you sure you want to cancel this mandate? This action cannot be undone.")) return;

        setActionLoading(true);
        try {
            await mandateService.cancelMandate(mandate.id);
            alert("Mandate cancelled successfully.");
            fetchMandate();
        } catch (err) {
            console.error("Failed to cancel", err);
            alert("Failed to cancel mandate.");
        } finally {
            setActionLoading(false);
        }
    };

    const templateContent = parseMandateTemplate({
        mandate,
        property: propertyDetails,
    });

    return (
        <div className="max-w-7xl mx-auto pb-20 relative">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                    <Link
                        href="/dashboard/mandates"
                        className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                                Mandate #{mandate.id.toString().slice(0, 8)}
                            </h1>
                            {isExpiringSoon && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold border border-yellow-100">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Expiring Soon
                                </span>
                            )}
                            {isExpired && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-100">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Expired
                                </span>
                            )}
                            {isActive && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-100">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Active
                                </span>
                            )}
                            {isRejected && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Rejected
                                </span>
                            )}
                            {isTerminatedByUser && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Cancelled
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500" suppressHydrationWarning>
                            Created on {new Date(mandate.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Actions Container */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    {isExpired && (
                        <button
                            onClick={handleRenew}
                            disabled={actionLoading}
                            className="flex items-center justify-center gap-2 bg-primary-green hover:bg-dark-green text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow"
                        >
                            {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                            Renew Mandate
                        </button>
                    )}

                    {(isActive || isPending) && (
                        <button
                            onClick={handleCancel}
                            disabled={actionLoading}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors shadow-sm"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel Mandate
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Document Viewer */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Official Mandate Document
                            </h3>
                            {isPending && !scrolledToBottom && (
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                    Please scroll to the bottom to sign
                                </span>
                            )}
                        </div>
                        <div className="p-6 bg-gray-100/50">
                            {propertyDetails ? (
                                <MandateLetter
                                    dealType={mandate.deal_type}
                                    property={propertyDetails}
                                    mandate={mandate}
                                    onSign={(file) => setSignature(file)}
                                    user={user || undefined}
                                    isSigned={mandate.status === 'ACTIVE' || !!mandate.broker_signature}
                                    signatureUrl={typeof mandate.broker_signature === 'string' ? mandate.broker_signature : undefined}
                                    ownerSignatureUrl={typeof mandate.seller_signature === 'string' ? mandate.seller_signature : undefined}
                                />
                            ) : (
                                <div className="flex justify-center py-12 text-gray-400">
                                    <Loader2 className="animate-spin mb-2" />
                                    <span className="ml-2">Loading document details...</span>
                                </div>
                            )}
                            <div ref={scrollRef} className="h-1" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {/* Actions Card */}
                    {isPending && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
                            <h3 className="font-bold text-gray-900 mb-4">Actions Required</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                This mandate is pending your acceptance. Please review the document on the left carefully.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowSignModal(true)}
                                    disabled={!scrolledToBottom}
                                    className="w-full bg-primary-green hover:bg-dark-green text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!scrolledToBottom ? "Please read the entire document first" : ""}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Accept & Sign
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject Request
                                </button>
                            </div>
                        </div>
                    )}

                    {isActive && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Contract Status</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Mandate is <span className="font-bold text-green-700">Active</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <span>Expires on <span className="font-bold text-gray-900">{new Date(mandate.expiry_date!).toLocaleDateString()}</span></span>
                            </div>
                        </div>
                    )}

                    {isTerminatedByUser && (
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
                            <h3 className="font-bold text-red-900 mb-2">Mandate Cancelled</h3>
                            <p className="text-sm text-red-700">
                                This mandate was manually cancelled by the user.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sign Modal */}
            {showSignModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 sm:duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold">Digital Signature</h3>
                            <button onClick={() => setShowSignModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 lg:hidden">
                                <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">Please sign below to accept the mandate agreement. This action is legally binding.</p>

                        <SignaturePad onEnd={(file) => setSignature(file)} />

                        {/* Terms Checkbox */}
                        <div className="mt-4 flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <input
                                type="checkbox"
                                id="terms_agreement"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
                            />
                            <label htmlFor="terms_agreement" className="text-sm text-gray-600 cursor-pointer select-none">
                                I have read and agree to the <span className="font-semibold text-gray-900">Mandate Terms and Conditions</span>.
                            </label>
                        </div>

                        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100 pb-4 sm:pb-0 safe-area-bottom">
                            <button
                                onClick={() => setShowSignModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handeAccept}
                                disabled={!signature || !isAgreed || actionLoading}
                                className="w-full sm:w-auto bg-primary-green hover:bg-dark-green text-white px-6 py-3 sm:py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                title={!isAgreed ? "Please agree to terms" : (!signature ? "Please sign" : "")}
                            >
                                {actionLoading && <Loader2 className="animate-spin w-4 h-4" />}
                                Confirm & Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-2 text-red-600">Reject Mandate</h3>
                        <p className="text-gray-500 text-sm mb-4">Please provide a reason for rejecting this mandate request.</p>

                        <textarea
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-32"
                            placeholder="e.g., Commission rate is too low..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason || actionLoading}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {actionLoading && <Loader2 className="animate-spin w-4 h-4" />}
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
