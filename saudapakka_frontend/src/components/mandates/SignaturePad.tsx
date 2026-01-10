"use client";

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
    onEnd: (file: File | null) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onEnd }) => {
    const sigPad = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const clear = () => {
        sigPad.current?.clear();
        setIsEmpty(true);
        onEnd(null);
    };

    const save = () => {
        if (sigPad.current?.isEmpty()) return;

        // Convert to blob/file
        sigPad.current?.getCanvas().toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "signature.png", { type: "image/png" });
                onEnd(file);
            }
        });
    };

    return (
        <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden relative group">
                <SignatureCanvas
                    ref={sigPad}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-48 border-0 cursor-crosshair bg-white'
                    }}
                    onEnd={() => {
                        setIsEmpty(false);
                        save(); // Auto-trigger callback on end of stroke? 
                        // Better to strictly wait for user to be done, but for smooth UI let's rely on parent form submit calling this logic or just saving state on change.
                        // The prompt says "Signature Pad: Integrate a digital signature canvas".
                        // Typically we want a clear "Save/Confirm" action or just capture it.
                        // Let's stick to capture on End for state update.
                    }}
                />
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
                        Sign Here
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={(e) => { e.preventDefault(); clear(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Eraser className="w-4 h-4" />
                    Clear
                </button>
            </div>
        </div>
    );
};

export default SignaturePad;
