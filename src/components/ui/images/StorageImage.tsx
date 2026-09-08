import { FC, useEffect, useState } from "react";

interface Props {
  src: string | null;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

const StorageImage: FC<Props> = ({ src, alt, className, fallback }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export default StorageImage;
