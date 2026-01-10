import React, { useRef, useState } from 'react';
import { PropertyDetail, Mandate, User, DealType } from '@/types'; // Added DealType
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, CheckCircle } from 'lucide-react';

interface MandateLetterProps {
    property: PropertyDetail;
    mandate?: Partial<Mandate>;
    user?: Partial<User>;
    dealType?: DealType; // New Prop
    onSign?: (file: File) => void;
    isSigned?: boolean;
    signatureUrl?: string; // Partner Signature
    ownerSignatureUrl?: string; // Owner Signature
    activeSigner?: 'SELLER' | 'BROKER'; // New Prop: Controls which slot is interactive
}

export const MandateLetter: React.FC<MandateLetterProps> = ({
    property,
    mandate,
    dealType = DealType.WITH_BROKER, // Default
    onSign,
    isSigned = false,
    signatureUrl,
    ownerSignatureUrl,
    activeSigner = 'SELLER' // Default to Seller for backwards compat if needed, but Page should pass explicitly
}) => {
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const sigPad = useRef<SignatureCanvas>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);

    // --- Helpers ---
    const formatCurrency = (amount: number | string | undefined) => {
        if (!amount) return "₹ 0";
        return Number(amount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(date);
    };

    const calculateEndDate = (startDate: Date = new Date()) => {
        const end = new Date(startDate);
        end.setDate(end.getDate() + 90);
        return end;
    };

    // --- Data Mapping ---
    const ownerName = property.owner_details?.full_name || "Property Owner";

    // Logic for Partner Name & Designation
    const isPlatform = dealType === DealType.WITH_PLATFORM;

    const partnerName = isPlatform
        ? "SaudaPakka (A Brand of SaudaPakka)"
        : (mandate?.broker_name || "Exclusive Marketing and Sales Partner");

    const designation = isPlatform
        ? "Official Exclusive Platform Marketing Partner"
        : "Exclusive Marketing and Sales Partner";

    // Address Logic
    const fullAddress = [
        property.address_line,
        property.city,
        property.pincode
    ].filter(Boolean).join(', ') || "Property Address";

    // Specs
    const area = property.carpet_area ? `${property.carpet_area} Sq.Ft` : "As per records";
    const floor = property.specific_floor ? `Floor ${property.specific_floor}` : "Standard Unit";

    const today = new Date();
    const startDateStr = formatDate(today);
    const endDateStr = formatDate(calculateEndDate(today));

    const project = property.project_name || property.title || "Project Name";

    // --- Scroll Detection ---
    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                setScrolledToBottom(true);
            }
        }
    };

    // --- Signature Logic ---
    const clearSignature = () => {
        sigPad.current?.clear();
        setSignatureFile(null);
    };

    const saveSignature = () => {
        if (sigPad.current?.isEmpty()) return;
        sigPad.current?.getCanvas().toBlob((blob: Blob | null) => {
            if (blob && onSign) {
                const file = new File([blob], "signature.png", { type: "image/png" });
                setSignatureFile(file);
                onSign(file);
            }
        });
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-slate-50 border border-slate-200 shadow-sm rounded-xl overflow-hidden my-8 font-sans text-slate-800">
            {/* Header / Brand Strip */}
            <div className="h-2 bg-slate-800 w-full" />

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="p-12 md:p-16 max-h-[80vh] overflow-y-auto custom-scrollbar relative"
            >
                {/* Title */}
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-serif font-bold text-slate-900 border-b-2 border-slate-200 pb-4 inline-block">
                        MANDATE LETTER
                    </h1>
                    <p className="mt-4 text-slate-500 text-sm uppercase tracking-widest font-medium">Marketing Authority Agreement</p>
                </header>

                <div className="space-y-8 text-base leading-relaxed whitespace-pre-wrap">
                    {/* Date and Parties */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p><strong>Date:</strong> <span className="bg-yellow-50/50 px-1 rounded font-medium">{startDateStr}</span></p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="mb-2"><strong>To,</strong></p>
                        <p className="text-lg font-semibold">{ownerName}</p>
                        <p>{project}</p>
                        <p>{fullAddress}</p>
                    </div>

                    <p className="mb-6">Dear <strong>Sir/Madam</strong>,</p>

                    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 mb-8">
                        <p className="font-serif italic text-center text-slate-700">
                            Re: Appointment as <strong>{designation}</strong> for Sale/Lease of Property
                        </p>
                    </div>

                    {/* Section 1 */}
                    <section className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">1. Appointment</h3>
                        <p className="leading-relaxed">
                            We, <strong>{ownerName}</strong>, hereby appoint <span className="font-bold bg-yellow-50/50 px-1 rounded">{partnerName}</span> (hereinafter referred to as “the Marketing Partner”),
                            for 90 days with effect from <strong>{startDateStr}</strong> until <strong>{endDateStr}</strong>,
                            as <strong>{designation}</strong> for the property detailed below.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">2. Property Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-white p-6 rounded-lg border border-slate-200/60">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Project</span>
                                <span className="font-medium text-right">{project}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Unit Type</span>
                                <span className="font-medium text-right">{property.bhk_config ? `${property.bhk_config} BHK` : property.property_type_display}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Carpet Area</span>
                                <span className="font-medium text-right">{area}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Floor</span>
                                <span className="font-medium text-right">{floor}</span>
                            </div>
                            <div className="col-span-1 md:col-span-2 flex justify-between pt-2">
                                <span className="text-slate-500">Full Address</span>
                                <span className="font-medium text-right max-w-[60%] text-right">{fullAddress}</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">3. Authority Granted</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
                            <li><strong>Marketing & Promotion:</strong> Design, develop and execute all marketing campaigns (digital, print, hoarding, events).</li>
                            <li><strong>Lead Generation:</strong> Arrange site visits, manage inquiries, and follow‑up with prospective buyers.</li>
                            <li><strong>Negotiation:</strong> Negotiate sale/lease terms within the price band approved by Owner.</li>
                            <li><strong>Documentation:</strong> Assist in preparation of sale agreements and related paperwork.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">4. Commission & Payment Terms</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
                            <li>
                                <strong>Commission Rate:</strong> <strong>{mandate?.commission_rate || '2'}%</strong> of the total sale/lease consideration
                                or a fixed amount of <strong>{formatCurrency(property.total_price)}</strong> (approximate based on ask).
                            </li>
                            <li><strong>Payment Schedule:</strong> Within <strong>7 days</strong> of receipt of full payment from buyer/tenant.</li>
                            <li><strong>GST:</strong> As applicable per law.</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">5. Governing Law</h3>
                        <p className="leading-relaxed">
                            This mandate shall be governed by the laws of <strong>India</strong>.
                            Disputes shall be resolved amicably; failing which, jurisdiction will lie with the courts of <strong>Mumbai, Maharashtra</strong>.
                        </p>
                    </section>

                    <hr className="my-12 border-slate-200" />

                    {/* Section 6 - Signature */}
                    <div className="bg-slate-100/50 p-8 rounded-xl border border-slate-200">
                        <h3 className="text-xl font-serif font-bold text-center mb-8">Accepted and Agreed</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left: Owner (Initiator usually) */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className={`w-full relative rounded-lg ${activeSigner === 'SELLER' && !isSigned && !ownerSignatureUrl ? 'border-2 border-dashed border-slate-300 bg-white hover:border-slate-400 transition-colors' : ''}`}>
                                    {/* Logic: 
                                        If activeSigner is SELLER: Show Canvas (unless signed).
                                        If activeSigner is NOT SELLER: Show Image or Placeholder.
                                    */}

                                    {activeSigner === 'SELLER' && !isSigned && !ownerSignatureUrl ? (
                                        <>
                                            <SignatureCanvas
                                                ref={sigPad}
                                                penColor="black"
                                                onEnd={saveSignature}
                                                canvasProps={{
                                                    className: 'w-full h-32 cursor-crosshair rounded-lg',
                                                }}
                                            />
                                            {!signatureFile && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400">
                                                    <span className="bg-white/80 px-2 py-1 text-sm rounded pointer-events-auto">Property Owner Sign Here</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="h-32 w-full flex items-end justify-center pb-2 border-b-2 border-slate-300 relative">
                                            {ownerSignatureUrl ? (
                                                <img src={ownerSignatureUrl} alt="Owner Signature" className="max-h-28 object-contain" />
                                            ) : (
                                                <span className="text-slate-400 text-sm font-handwriting italic text-3xl opacity-30">Pending Owner</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {activeSigner === 'SELLER' && !isSigned && !ownerSignatureUrl && signatureFile && (
                                    <button
                                        onClick={clearSignature}
                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Eraser className="w-3 h-3" /> Clear Signature
                                    </button>
                                )}

                                <div className="text-center">
                                    <p className="font-bold text-slate-900">{ownerName}</p>
                                    <p className="text-sm text-slate-500">Property Owner</p>
                                    <p className="text-xs text-slate-400 mt-1">{startDateStr}</p>
                                </div>
                            </div>

                            {/* Right: Partner (The Signer) */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className={`w-full relative rounded-lg ${activeSigner === 'BROKER' && !isSigned && !signatureUrl ? 'border-2 border-dashed border-slate-300 bg-white hover:border-slate-400 transition-colors' : ''}`}>
                                    {/* Logic: 
                                        If activeSigner is BROKER: Show Canvas.
                                        If activeSigner is NOT BROKER: Show Image or Placeholder.
                                    */}

                                    {activeSigner === 'BROKER' && !isSigned && !signatureUrl ? (
                                        <>
                                            <SignatureCanvas
                                                ref={sigPad}
                                                penColor="black"
                                                onEnd={saveSignature}
                                                canvasProps={{
                                                    className: 'w-full h-32 cursor-crosshair rounded-lg',
                                                }}
                                            />
                                            {!signatureFile && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400">
                                                    <span className="bg-white/80 px-2 py-1 text-sm rounded pointer-events-auto">Partner Sign Here</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="h-32 w-full flex items-center justify-center">
                                            {signatureUrl ? (
                                                <img src={signatureUrl} alt="Signature" className="max-h-28 object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-300">
                                                    <span className="text-sm italic">Pending Partner</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {activeSigner === 'BROKER' && !isSigned && !signatureUrl && signatureFile && (
                                    <button
                                        onClick={clearSignature}
                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Eraser className="w-3 h-3" /> Clear Signature
                                    </button>
                                )}

                                <div className="text-center">
                                    <h4 className="font-serif font-bold text-sm mb-2 uppercase text-slate-400">
                                        {isPlatform ? "For SaudaPakka" : "For Marketing Partner"}
                                    </h4>
                                    <p className="font-bold text-slate-900">{isPlatform ? "SaudaPakka Authorized Signatory" : partnerName}</p>
                                    <p className="text-sm text-slate-500">{designation}</p>
                                    <p className="text-xs text-slate-400 mt-1">{startDateStr}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                {!scrolledToBottom && !isSigned && !signatureUrl && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-3 rounded-full shadow-lg text-sm backdrop-blur-sm animate-pulse pointer-events-none z-50">
                        Please scroll to the bottom to sign
                    </div>
                )}
            </div>
        </div>
    );
};

export default MandateLetter;
