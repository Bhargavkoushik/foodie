import { useState } from "react";
import "./ReferralProgram.css";
import { toast } from "react-toastify";
import { Share2, Copy, Check } from "lucide-react";

const ReferralProgram = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  const referralCode = user.name
    ? `${user.name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "")}50`
    : "FOODIE50";

  const [copied, setCopied] = useState(false);
  const [referrals] = useState([]); // Honest demo: no fabricated accounts

  const copyToClipboard = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(referralCode);
      }
      setCopied(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: "Join me on Foodie!",
      text: `Order delicious food with Foodie! Use my referral code ${referralCode} to get 50% off on your first order.`,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Thanks for sharing!");
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="referral-container">
      {/* Hero Section */}
      <div className="referral-hero">
        <h1 className="hero-title">
          Refer Friends & <span className="gradient-text">Earn Rewards</span>
        </h1>
        <p className="hero-description">
          Share your referral code and earn credits when your friends join and place their first order 🚀
        </p>
      </div>

      {/* Referral Code Card */}
      <div className="referral-card">
        <h2>Your Referral Code</h2>
        <div className="referral-code-box">
          <span className="referral-code">{referralCode}</span>
          <button className="copy-btn" onClick={copyToClipboard}>
            {copied ? (
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Check size={16} /> Copied!
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Copy size={16} /> Copy
              </span>
            )}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <button
            className="share-btn"
            style={{ background: "#3b82f6" }}
            onClick={handleNativeShare}
          >
            <Share2 size={16} style={{ display: "inline", marginRight: "6px" }} />
            Share Code
          </button>

          <button
            className="share-btn twitter"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=Join%20me%20on%20Foodie%20and%20get%2050%25%20off%20your%20first%20order!%20Use%20code:%20${referralCode}`,
                "_blank"
              )
            }
          >
            Share on Twitter
          </button>

          <button
            className="share-btn whatsapp"
            onClick={() =>
              window.open(
                `https://api.whatsapp.com/send?text=Join%20me%20on%20Foodie%20and%20get%2050%25%20off%20your%20first%20order!%20Use%20code:%20${referralCode}`,
                "_blank"
              )
            }
          >
            Share on WhatsApp
          </button>
        </div>
      </div>

      {/* Honest Stats */}
      <div className="referral-stats">
        <div className="stat-box">
          <h3>0</h3>
          <p>Referrals Completed</p>
        </div>
        <div className="stat-box">
          <h3>0</h3>
          <p>Referrals Pending</p>
        </div>
        <div className="stat-box">
          <h3>$0.00</h3>
          <p>Rewards Earned</p>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="referral-history">
        <h2>Referral History</h2>
        {referrals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-color, #6b7280)", fontStyle: "italic" }}>
            <p>No referral activity recorded yet.</p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>
              Share your code above with friends to start tracking your referral rewards!
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Friend</th>
                <th>Email</th>
                <th>Date Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r, index) => (
                <tr key={index}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.date}</td>
                  <td className={r.status.toLowerCase()}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2>How it Works</h2>
        <ol>
          <li>Share your unique referral code with friends.</li>
          <li>They sign up using your code.</li>
          <li>Once they place their first order, you earn rewards.</li>
          <li>Track progress right here in your dashboard.</li>
        </ol>
      </div>
    </div>
  );
};

export default ReferralProgram;
