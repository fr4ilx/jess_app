import { useState } from "react";
import { Sparkles } from "lucide-react";

type Props = {
  size?: number; // pixels
  className?: string;
};

// Brand mark. Uses `public/panda_logo.png`. Falls back to a Sparkles icon if
// the file isn't present yet so the layout doesn't break during development.
export function PandaLogo({ size = 80, className = "" }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={`rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {imgFailed ? (
        <Sparkles
          className="text-primary"
          style={{ width: size * 0.5, height: size * 0.5 }}
          aria-hidden="true"
        />
      ) : (
        <img
          src="/panda_logo.png"
          alt="PandaWell"
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}
