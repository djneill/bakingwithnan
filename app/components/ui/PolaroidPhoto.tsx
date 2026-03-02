import { ThumbTack } from "~/components/ui/ThumbTack";

interface PolaroidPhotoProps {
  src: string;
  alt: string;
  caption?: string;
  rotation?: string;
  maxWidth?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function PolaroidPhoto({
  src,
  alt,
  caption,
  rotation,
  maxWidth = "280px",
  onClick,
  children,
}: PolaroidPhotoProps) {
  return (
    <div
      className={`bg-white p-3 pb-10 relative ${onClick ? "cursor-zoom-in" : ""}`}
      style={{
        maxWidth,
        transform: rotation,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
      }}
      onClick={onClick}
    >
      {/* Thumbtack */}
      <ThumbTack />
      <img src={src} alt={alt} className="w-full h-auto" />
      {caption && (
        <p className="absolute bottom-2.5 left-0 right-0 text-center font-handwriting text-sm text-gray-400">
          {caption}
        </p>
      )}
      {children}
    </div>
  );
}
