import { getInitials } from '../services/brandService';

interface LogoAvatarProps {
  logoUrl: string | null;
  storeName: string;
  brandColor: string;
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { container: 36, text: 13, radius: 10 },
  medium: { container: 52, text: 18, radius: 14 },
  large: { container: 72, text: 24, radius: 18 },
};

export function LogoAvatar({ logoUrl, storeName, brandColor, size = 'medium' }: LogoAvatarProps) {
  const dims = SIZES[size];
  const initials = getInitials(storeName);

  if (logoUrl) {
    return (
      <div
        className="overflow-hidden flex items-center justify-center"
        style={{
          width: dims.container,
          height: dims.container,
          borderRadius: dims.radius,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <img
          src={logoUrl}
          alt={storeName}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: dims.container,
        height: dims.container,
        borderRadius: dims.radius,
        backgroundColor: brandColor,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <span
        className="font-semibold text-white"
        style={{ fontSize: dims.text }}
      >
        {initials}
      </span>
    </div>
  );
}
