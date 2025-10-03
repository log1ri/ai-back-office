import { useState } from "react";
import { Copy, Check } from "lucide-react";
// Copy button component for code blocks
export default function CopyButton({ getText }: { getText: () => string }) {
    const [copied, setCopied] = useState(false);

    // Handle copy button click
    const handleCopy = async () => {
        try {
        const text = getText();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        } catch (err) {
        console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors duration-200 opacity-0 group-hover:opacity-100"
        title={copied ? "Copied!" : "Copy to clipboard"}
        >
        {/* Icon */}
        {copied ? (
            <Check size={16} className="text-green-500" />
        ) : (
            <Copy size={16} className="text-gray-600" />
        )}
        </button>
    );
}