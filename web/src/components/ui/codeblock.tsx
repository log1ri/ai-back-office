import { useRef } from "react";
import CopyButton from './copybutton'
// Custom pre component with copy functionality
export default function CodeBlock({ children, ...props }: any) {
  const preRef = useRef<HTMLPreElement>(null);
  
  const getTextContent = () => {
    // Try multiple ways to get the text content
    let text = "";
    
    // Method 1: From DOM element
    if (preRef.current) {
      text = preRef.current.textContent || preRef.current.innerText || "";
    }
    
    // Method 2: From children prop (fallback)
    if (!text && children) {
      if (typeof children === 'string') {
        text = children;
      } else if (children.props && children.props.children) {
        if (typeof children.props.children === 'string') {
          text = children.props.children;
        } else if (Array.isArray(children.props.children)) {
          text = children.props.children.join('');
        }
      }
    }

    return text;
  };

  return (
    <div className="relative group">
        
      <pre
        ref={preRef}
        {...props}
        className="!bg-white !font-semibold p-4 !rounded-lg !border border-[#7b64ea] !shadow-lg shadow-purple-200/50 overflow-x-auto dark:!bg-gray-800 dark:!text-white"
      >
        {children}
      </pre>

      <CopyButton getText={getTextContent} />
    </div>
  );
}