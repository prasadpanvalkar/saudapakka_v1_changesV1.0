import React from 'react';

const MandateTerms = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Mandate Agreement Terms</h3>
            <div className="h-64 overflow-y-auto space-y-4 text-gray-600 text-sm pr-2 custom-scrollbar">
                <p><strong>1. Parties Involved:</strong> This mandate agreement is entered into between the Initiator (Seller/Broker) and the Recipient (Broker/Seller/Platform), hereinafter referred to as the "Parties".</p>

                <p><strong>2. Scope of Mandate:</strong> The Owner grants the Broker the right to market and negotiate the sale/lease of the Property listed attached to this mandate. This right is subject to the exclusivity terms defined in the mandate details.</p>

                <p><strong>3. Term & Expiry:</strong> This mandate shall be valid for a period of 90 days (3 months) from the date of activation (signing by both parties). Upon expiry, it may be renewed by mutual consent.</p>

                <p><strong>4. Commission:</strong> The Broker is entitled to a commission as specified in this mandate upon the successful conclusion of a sale, lease, or binding agreement resulting from their introduction or efforts.</p>

                <p><strong>5. Exclusivity:</strong> If "Exclusive" is selected, the Owner agrees not to appoint other agents for this Property during the Term. If "Non-Exclusive", the Owner retains the right to market the property themselves or through other agents.</p>

                <p><strong>6. Termination:</strong> Either party may terminate this agreement with valid cause by providing written notice (via the platform's cancellation feature). Active negotiations initiated prior to termination may still be subject to commission.</p>

                <p><strong>7. Governing Law:</strong> This agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the property is located.</p>

                <p className="italic text-gray-400 text-xs mt-4">By digitally signing this document, you acknowledge that you have read, understood, and agreed to be bound by these terms.</p>
            </div>
        </div>
    );
};

export default MandateTerms;
