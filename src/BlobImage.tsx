import { useEffect, useState } from "react";

const BlobImage = ({ blobId }: { blobId: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch blob");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err) {
        console.error("Failed to load image:", err);
      }
    };

    fetchImage();
  }, [blobId]);

  return imageUrl ? (
    <img src={imageUrl} alt="Blob" style={{ maxWidth: "100%" }} />
  ) : (
    <p>Loading image...</p>
  );
};

export default BlobImage;
