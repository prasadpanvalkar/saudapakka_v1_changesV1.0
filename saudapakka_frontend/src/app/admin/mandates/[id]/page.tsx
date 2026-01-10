"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { mandateService } from "@/services/mandateService";
import { Mandate, MandateStatus, DealType } from "@/types/mandate";
import MandateLetter from "@/components/mandates/MandateLetter";
import SignaturePad from "@/components/mandates/SignaturePad";
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, XCircle, FileText, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { parseMandateTemplate } from "@/utils/mandateTemplateParser";

export default function AdminMandateDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as string;

    const [mandate, setMandate] = useState<Mandate | null>(null);
    const [propertyDetails, setPropertyDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Admin Action State
    const [showSignModal, setShowSignModal] = useState(false);
    const [signature, setSignature] = useState<File | null>(null);
    const [isAgreed, setIsAgreed] = useState(false);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) fetchMandate();
    }, [id]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setScrolledToBottom(true);
            },
            { threshold: 1.0 }
        );

        if (scrollRef.current) observer.observe(scrollRef.current);
        return () => observer.disconnect();
    }, [loading, mandate]);

    const fetchMandate = async () => {
        try {
            const data = await mandateService.getMandateById(id);
            setMandate(data);
            if (data.property_item) {
                const propRes = await axios.get(`/api/properties/${data.property_item}/`);
                setPropertyDetails(propRes.data);
            }
        } catch (err) {
            console.error("Failed to load mandate", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdminSign = async () => {
        if (!signature || !mandate) return;
        setActionLoading(true);
        try {
            await mandateService.acceptAndSign(mandate.id, signature);
            setShowSignModal(false);
            fetchMandate();
            alert("Mandate Verified and Signed Successfully!");
        } catch (err: any) {
            console.error("Failed to sign", err);
            alert(err.response?.data?.message || "Failed to sign mandate.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-green w-8 h-8" /></div>;
    if (!mandate) return <div className="p-8 text-center text-gray-500">Mandate not found.</div>;

    const isPlatformDeal = mandate.deal_type === DealType.WITH_PLATFORM;
    const isPending = mandate.status === MandateStatus.PENDING;
    const isActive = mandate.status === MandateStatus.ACTIVE;

    return (
        <div className="max-w-7xl mx-auto pb-20 relative p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/mandates" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Verification: Mandate #{mandate.id}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPlatformDeal ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isPlatformDeal ? 'Platform Deal' : 'Broker Deal'}
                        </span>
                        <span className="text-sm text-gray-500">
                            • Created {new Date(mandate.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Document Viewer */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Official Mandate Document
                            </h3>
                            {isPending && isPlatformDeal && !scrolledToBottom && (
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                    Scroll to review
                                </span>
                            )}
                        </div>
                        <div className="p-6 bg-gray-100/50">
                            {propertyDetails ? (
                                <MandateLetter
                                    dealType={mandate.deal_type}
                                    property={propertyDetails}
                                    mandate={mandate}
                                    user={user || undefined}
                                    isSigned={isActive || !!mandate.broker_signature} // Show signatures if active
                                    signatureUrl={typeof mandate.broker_signature === 'string' ? mandate.broker_signature : undefined} // Admin/Broker sig
                                    ownerSignatureUrl={typeof mandate.seller_signature === 'string' ? mandate.seller_signature : undefined}
                                // Override branding for Platform deals in Admin View if necessary, 
                                // but MandateLetter logic should handle "WITH_PLATFORM" -> "SaudaPakka" automatically.
                                />
                            ) : (
                                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                            )}
                            <div ref={scrollRef} className="h-1" />
                        </div>
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
                        <h3 className="font-bold text-gray-900 mb-4">Admin Controls</h3>

                        {isPlatformDeal && isPending ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                                    <h4 className="font-bold mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Action Required
                                    </h4>
                                    <p>This is a Platform Deal. Please review the terms and sign as the Authorized Signatory for SaudaPakka.</p>
                                </div>
                                <button
                                    onClick={() => setShowSignModal(true)}
                                    disabled={!scrolledToBottom}
                                    className="w-full bg-primary-green hover:bg-dark-green text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Review & Sign
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg border text-sm ${isActive ? 'bg-green-50 border-green-100 text-green-800' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                    <h4 className="font-bold mb-1 flex items-center gap-2">
                                        {isActive ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        Status: {mandate.status}
                                    </h4>
                                    <p>{isActive ? "This mandate is active and valid." : "No admin action required at this stage."}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Sign Modal */}
            {showSignModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Authorized Signatory</h3>
                            <button onClick={() => setShowSignModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Sign below to accept this mandate on behalf of <strong>SaudaPakka</strong>.
                        </p>

                        <SignaturePad onEnd={(file) => setSignature(file)} />

                        <div className="mt-4 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="admin_agree"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 text-primary-green rounded focus:ring-primary-green"
                            />
                            <label htmlFor="admin_agree" className="text-sm text-gray-600 cursor-pointer">
                                I confirm that this property meets platform standards and I am adding my signature as the official representative.
                            </label>
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={() => setShowSignModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button
                                onClick={handleAdminSign}
                                disabled={!signature || !isAgreed || actionLoading}
                                className="bg-primary-green hover:bg-dark-green text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading && <Loader2 className="animate-spin w-4 h-4" />}
                                Sign & Validate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
