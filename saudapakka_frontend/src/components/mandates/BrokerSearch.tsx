import React, { useState } from 'react';
import { mandateService } from '@/services/mandateService';
import { BrokerProfile } from '@/types/mandate';
import { Search, Loader2, UserCheck, AlertCircle } from 'lucide-react';

interface BrokerSearchProps {
    onSelect: (broker: BrokerProfile) => void;
    selectedBroker: BrokerProfile | null;
}

const BrokerSearch: React.FC<BrokerSearchProps> = ({ onSelect, selectedBroker }) => {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<BrokerProfile[]>([]);

    const handleSearch = async () => {
        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await mandateService.searchBroker(mobile);
            setResults(data);
            if (data.length === 0) {
                setError('No active broker found with this number.');
            }
        } catch (err) {
            setError('Failed to search broker. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Find a Broker</label>

            {!selectedBroker ? (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter Broker's Mobile Number"
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="border border-gray-200 rounded-lg divide-y">
                            {results.map((broker) => (
                                <div key={broker.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                            {broker.full_name ? broker.full_name[0] : '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{broker.full_name || 'Unknown Broker'}</p>
                                            <p className="text-xs text-gray-500">{broker.mobile_number}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onSelect(broker);
                                            setResults([]);
                                            setMobile('');
                                        }}
                                        className="text-sm bg-primary-green/10 text-primary-green px-3 py-1.5 rounded-full hover:bg-primary-green hover:text-white transition-colors font-medium"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-primary-green">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{selectedBroker.full_name}</p>
                            <p className="text-sm text-gray-500">Selected Broker</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelect(null as any)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                        Change
                    </button>
                </div>
            )}
        </div>
    );
};

export default BrokerSearch;
