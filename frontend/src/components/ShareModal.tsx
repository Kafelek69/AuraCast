import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  channelName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ channelName, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/${channelName}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-[#2b2b34] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[#efeff1]">
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#25252b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#272730] flex items-center justify-center text-[var(--brand-primary)]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Udostępnij transmisję</h2>
            <p className="text-xs text-gray-400">Wyślij znajomym i pomóż kanałowi rosnąć</p>
          </div>
        </div>

        {/* Pole z linkiem */}
        <div className="flex items-center gap-2 bg-[#101013] border border-[#2a2a34] rounded-xl p-2 mb-5">
          <input 
            type="text" 
            readOnly 
            value={shareUrl}
            className="bg-transparent flex-1 text-xs text-gray-300 outline-none px-2 font-mono"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-[var(--brand-primary)] text-[var(--brand-contrast)] hover:opacity-90'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Skopiowano' : 'Kopiuj'}
          </button>
        </div>

        {/* Szybkie przyciski */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=Ogl%C4%85dam%20teraz%20stream%20u%20${channelName}%20na%20AuraCast!&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-[#14171a] border border-[#272730] hover:border-gray-500 text-center text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Twitter / X
          </a>
          <a
            href={`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Stream ${channelName} na żywo!`)}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-[#14171a] border border-[#272730] hover:border-gray-500 text-center text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Reddit
          </a>
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-[#14171a] border border-[#272730] hover:border-gray-500 text-center text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Discord
          </button>
        </div>

      </div>
    </div>
  );
};
