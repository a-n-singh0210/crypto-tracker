import { useState } from "react";
import { addCrypto } from "../services/api";
import { PlusCircle } from "lucide-react";

export default function AddCryptoForm({ username, refresh }) {
  const [cryptoName, setCryptoName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cryptoName || !quantity || !buyPrice) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await addCrypto({ 
        cryptoName, 
        quantity: parseFloat(quantity), 
        buyPrice: parseFloat(buyPrice), 
        username 
      });

      setCryptoName("");
      setQuantity("");
      setBuyPrice("");
      refresh();
    } catch (err) {
      console.error("Add failed:", err);
      setError(err.message || "Failed to add crypto. Check if all fields are correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="add-crypto-form" className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Add New Asset</h3>
        <p className="text-xs text-gray-500">Enter details to track a new cryptocurrency</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1">Asset Name</label>
          <input 
            id="asset-name-input"
            placeholder="e.g. BTC" 
            value={cryptoName} 
            onChange={e => setCryptoName(e.target.value)} 
            className="w-full p-4 rounded-2xl bg-gray-900/40 text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1">Quantity</label>
            <input 
              id="quantity-input"
              type="number"
              step="any"
              placeholder="0.00" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-gray-900/40 text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1">Price (₹)</label>
            <input 
              id="buy-price-input"
              type="number"
              step="any"
              placeholder="0.00" 
              value={buyPrice} 
              onChange={e => setBuyPrice(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-gray-900/40 text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
              required
            />
          </div>
        </div>

        {error && (
          <div id="add-error-msg" className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <button 
          id="add-submit-btn"
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-xl shadow-blue-500/10'} p-4 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-3 mt-2`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <PlusCircle size={20} />
              <span>Add to Portfolio</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}