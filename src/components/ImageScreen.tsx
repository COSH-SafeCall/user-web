import { Canvas } from "./Canvas";

type ImageScreenProps = {
  src: string;
  onClick: () => void;
};

export function ImageScreen({
  src,
  onClick,
}: ImageScreenProps) {
  return (
    <Canvas className="image-screen">
      <button className="image-button" onClick={onClick}>
        <img src={src} alt="mock" />
      </button>
    </Canvas>
  );
}
