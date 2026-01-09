"use client";

import Link from "next/link";
import { MapPin, Bed, Bath, Maximize, Heart, Phone, MessageCircle, CheckCircle } from "lucide-react";
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

export default function PropertyCardHorizontal({ property }: { property: Property }) {
    const router = useRouter();
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(property.is_saved || false);
    const [loadingSave, setLoadingSave] = useState(false);

    const mainImage = property.images && property.images.length > 0
        ? property.images[0].image
        : "https://placehold.co/600x400?text=SaudaPakka+Property";

    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`;
        }
        if (price >= 100000) {
            return `₹${(price / 100000).toFixed(0)} Lac`;
        }
        return `₹${price.toLocaleString("en-IN")}`;
    };

    const formatPricePerSqft = (price: number, area: string) => {
        const areaNum = parseFloat(area);
        if (areaNum > 0) {
            return `₹${Math.round(price / areaNum).toLocaleString("en-IN")}/sqft`;
        }
        return "";
    };

    const isVerified = property.verification_status === "VERIFIED";
    const isReady = property.availability_status === "READY" || property.property_status === "READY" || !property.availability_status;

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "1d ago";
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    };

    const handleWhatsApp = () => {
        const phone = property.whatsapp_number || "919999999999";
        const message = `Hi, I'm interested in your property "${property.title}" listed at ${formatPrice(Number(property.total_price))} in ${property.locality}, ${property.city}. Please share more details.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
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

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group">
            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative md:w-64 flex-shrink-0">
                    <Link href={`/property/${property.id}`}>
                        <img
                            src={mainImage}
                            alt={property.title}
                            className="h-48 md:h-full w-full object-cover"
                        />
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow ${property.listing_type === "SALE"
                            ? "bg-[#2D5F3F] text-white"
                            : "bg-amber-500 text-white"
                            }`}>
                            {property.listing_type === "SALE" ? "RESALE" : "RENT"}
                        </span>
                        {property.is_hot_deal && (
                            <span className="bg-orange-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow">
                                FEATURED
                            </span>
                        )}
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={loadingSave}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow">
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                    </button>

                    {/* Image Count */}
                    {property.images && property.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                            📷 {property.images.length}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col min-w-0">
                    {/* Top Row */}
                    <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                            <Link href={`/property/${property.id}`}>
                                <h3 className="text-base font-bold text-gray-900 hover:text-[#2D5F3F] transition-colors truncate">
                                    {property.title}
                                </h3>
                            </Link>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                <span className="text-blue-600 font-medium">{property.bhk_config} BHK {property.property_type.replace("_", " ")}</span>
                                {" "}in {property.locality}, {property.city}
                            </p>
                        </div>
                        {isVerified && (
                            <div className="flex items-center gap-1 text-green-600 text-xs font-medium whitespace-nowrap">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Verified
                            </div>
                        )}
                    </div>

                    {/* Price & Specs Row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3">
                        <div>
                            <span className="text-xl font-black text-gray-900">{formatPrice(Number(property.total_price))}</span>
                            <span className="text-[10px] text-gray-400 ml-1">{formatPricePerSqft(Number(property.total_price), property.carpet_area)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Maximize className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold">{property.carpet_area}</span>
                            <span className="text-gray-400">sqft</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Bed className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold">{property.bhk_config}</span>
                            <span className="text-gray-400">BHK</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Bath className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold">{property.bathrooms}</span>
                            <span className="text-gray-400">Baths</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isReady ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                            }`}>
                            {isReady ? "Ready To Move" : "Under Construction"}
                        </span>
                    </div>

                    {/* Description */}
                    {property.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                            {property.description}
                        </p>
                    )}

                    {/* Bottom Row */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                        {/* Owner Info */}
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#2D5F3F] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                O
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400">{getTimeAgo(property.created_at)}</p>
                                <p className="text-xs font-semibold text-gray-700">Owner</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleWhatsApp}
                                className="flex items-center gap-1.5 px-3 py-2 border border-green-500 text-green-600 rounded-lg font-medium text-xs hover:bg-green-50 transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                            </button>
                            <Link href={`/property/${property.id}`}>
                                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2D5F3F] text-white rounded-lg font-medium text-xs hover:bg-[#1B3A2C] transition-colors shadow-sm">
                                    <Phone className="w-3.5 h-3.5" />
                                    Contact
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
