import React, { useState } from "react";
import { Star, X, CheckCircle, MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function FeedbackModal({ donation, toUserId, toUserName, onClose, onSubmitted }) {
  const { user } = useSelector((state) => state.auth);
  const [score, setScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [category, setCategory] = useState("overall");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        "/api/chat/ratings",
        {
          toUserId,
          donationId: donation._id,
          score,
          category,
          feedback,
        },
        config
      );

      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rating & Feedback
            </h3>
            <p className="text-xs text-gray-500">Rate your partner for this donation activity</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center space-y-2 py-2">
            <span className="text-xs font-bold text-gray-700">Reviewing Partner: {toUserName || "Partner"}</span>
            
            {/* Interactive Star Picker */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setScore(star)}
                  onMouseEnter={() => setHoverScore(star)}
                  onMouseLeave={() => setHoverScore(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverScore || score) >= star
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 block">{score} out of 5 Stars</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Feedback Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
            >
              <option value="overall">Overall Experience</option>
              <option value="food_quality">Food Quality & Freshness</option>
              <option value="punctuality">Punctuality & Timeliness</option>
              <option value="hygiene">Hygiene & Thermal Packaging</option>
              <option value="cooperation">Cooperation & Communication</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Review / Comments</label>
            <textarea
              required
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe your experience with pickup, food quality, or delivery handoff..."
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
