import { useEffect, useRef } from "react";
import ClickSpark, { type ClickSparkHandle } from "./ClickSpark";

// Ink-dash sparks on every click. The spark canvas is a fixed, click-through
// layer; clicks are picked up on the document and sent to it.
export default function ClickSparkLayer() {
  const ref = useRef<ClickSparkHandle>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      ref.current?.spark(event.clientX, event.clientY);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <ClickSpark
      ref={ref}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
      sparkColor={["#2b2420", "#e2483d"]}
      sparkSize={9}
      sparkRadius={20}
      sparkCount={6}
      sparkWidth={1.6}
      duration={420}
      easing="ease-out"
      shape="line"
      randomness={0.3}
    />
  );
}
