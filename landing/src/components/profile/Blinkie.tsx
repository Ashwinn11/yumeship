import { useEffect, useState } from 'react';
import type { BlinkieTemplate } from '../../constants/blinkies';

const FRAME_INTERVAL_MS = 150;

// the source art's real resolution — every other size is this ratio scaled,
// never stretched, so the pixel art never distorts
const NATIVE_WIDTH = 150;
const NATIVE_HEIGHT = 20;
const ASPECT_RATIO = NATIVE_WIDTH / NATIVE_HEIGHT;

/**
 * One template's background, rendered at (or scaled proportionally from) the
 * real blinkie resolution (150×20) with a real pixel-art background
 * animation — cycling through its actual frames on an interval, the same
 * way the source GIF would, not a single static frame. `image-rendering:
 * pixelated` keeps every frame crisp rather than blurring like a photo
 * would. Text is set in Press Start 2P (a real bitmap-style font, SIL OFL)
 * instead of the app's rounded UI font.
 */
export function Blinkie({ template, text, width = NATIVE_WIDTH }: { template: BlinkieTemplate; text: string; width?: number }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (template.frameCount <= 1) return;
    setFrame(0);
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % template.frameCount);
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [template.bgBase, template.frameCount]);

  const height = width / ASPECT_RATIO;
  const scale = width / NATIVE_WIDTH;

  return (
    <div
      className="blinkie"
      style={{
        width,
        height,
        backgroundImage: `url(/blinkies/${template.bgBase}-${frame}.png)`,
        backgroundSize: `${width}px ${height}px`,
      }}
    >
      <span className="blinkie-text" style={{ color: template.textColor, fontSize: 7 * scale, maxWidth: 118 * scale }}>
        {text}
      </span>
    </div>
  );
}
