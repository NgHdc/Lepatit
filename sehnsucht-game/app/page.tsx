import Scene from "@/components/canvas/Scene";
import Overlay from "@/components/ui/Overlay";

export default function Home() {
  return (
    <main className="w-full h-screen relative">
      <Overlay />
      <Scene />
    </main>
  );
}