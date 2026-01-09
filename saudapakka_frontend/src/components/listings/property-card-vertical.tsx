"use client";

import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/axios";

export interface Property {
    id: string;
    title: string;
    total_price: number;
    property_type: string;
    listing_type: string;
    address_line: string;
    locality: string;
    city: string;
    bhk_config: number;
    bathrooms: number;
    carpet_area: string;
    verification_status: string;
    images: { id: string; image: string }[];
    has_7_12: boolean;
    has_mojani: boolean;
    created_at: string;
    property_status?: string;
    is_hot_deal?: boolean;
    is_new?: boolean;
    whatsapp_number?: string;
    description?: string;
    availability_status?: string;
    is_saved?: boolean;
}

export default function PropertyCardVertical({ property }: { property: Property }) {
    const router = useRouter();
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(property.is_saved || false);
    const [loadingSave, setLoadingSave] = useState(false);

    const placeholder = "https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image";

    // Get images - main + 2 side images (with fallbacks)
    const images = property.images || [];
    const mainImage = images[0]?.image || placeholder;
    const sideImage1 = images[1]?.image || images[0]?.image || placeholder;
    const sideImage2 = images[2]?.image || images[1]?.image || images[0]?.image || placeholder;

    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹ ${(price / 10000000).toFixed(2)} Cr`;
        }
        if (price >= 100000) {
            return `₹ ${(price / 100000).toFixed(0)} Lac`;
        }
        return `₹ ${price.toLocaleString("en-IN")}`;
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/login");
            return;
        }

        try {
            setLoadingSave(true);
            await api.post(`/api/properties/${property.id}/save_property/`);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error("Failed to save property", error);
        } finally {
            setLoadingSave(false);
        }
    };

    const priceLabel = property.listing_type === "RENT" ? "/month" : "";

    // Format location - handle missing values
    const location = [property.locality, property.city].filter(Boolean).join(", ") || "Location not specified";

    return (
        <Link href={`/property/${property.id}`} className="block relative group">
            <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
        shadow-[0_4px_20px_rgba(0,0,0,0.12)] 
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] 
        hover:-translate-y-1
        border border-gray-200">

                <div className="flex gap-1.5 p-2.5 h-48 relative">
                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={loadingSave}
                        className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                    </button>

                    {/* Main Image - Left (larger) */}
                    <div className="flex-[2] rounded-xl overflow-hidden bg-gray-100">
                        <img
                            src={mainImage}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                        />
                    </div>

                    {/* Side Images - Right (stacked) */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-[calc(50%-3px)] rounded-xl overflow-hidden bg-gray-100">
                            <img
                                src={sideImage1}
                                alt="View 1"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                            />
                        </div>
                        <div className="h-[calc(50%-3px)] rounded-xl overflow-hidden bg-gray-100">
                            <img
                                src={sideImage2}
                                alt="View 2"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-3 pb-4 pt-2">
                    {/* Title & Price Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        {/* Left - Property Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate">
                                {property.title || "Untitled Property"}
                            </h3>
                            <p className="text-gray-500 text-xs flex items-center gap-1 truncate mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{location}</span>
                            </p>
                        </div>

                        {/* Right - Price */}
                        <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                                {formatPrice(Number(property.total_price) || 0)}
                                <span className="text-xs font-normal text-gray-400">{priceLabel}</span>
                            </p>
                        </div>
                    </div>

                    {/* Property Specs Row - Fixed height, no wrap */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 overflow-hidden">
                        {/* BHK */}
                        {property.bhk_config && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="font-semibold whitespace-nowrap">{property.bhk_config} BHK</span>
                            </div>
                        )}

                        {/* Area */}
                        {property.carpet_area && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span className="font-semibold whitespace-nowrap">{property.carpet_area} sqft</span>
                            </div>
                        )}

                        {/* Bathrooms */}
                        {property.bathrooms && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                                <span className="font-semibold whitespace-nowrap">{property.bathrooms} Bath</span>
                            </div>
                        )}

                        {/* Property Type - pushed to right */}
                        <div className="ml-auto flex-shrink-0">
                            <span className="text-[10px] font-medium text-[#2D5F3F] bg-green-50 px-2 py-0.5 rounded whitespace-nowrap">
                                {property.property_type?.replace("_", " ") || "Property"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
