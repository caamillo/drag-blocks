'use client'

import { ReactElement, useRef } from "react";
import Box from "./components/Box";
import Floor from "./components/Floor";

const TileSize = 60

export default function Home() {

  const blockARef = useRef<ReactElement>(null)
  const blockBRef = useRef<ReactElement>(null)

  return (
    <div className="flex items-center justify-center h-screen select-none">
      <Floor
        TileSize={TileSize}
      >
        <Box
            Width={5}
            Height={10}
            AnchorRef={blockARef}
          >
            <div ref={ blockARef } className="bg-slate-500 w-full h-full rounded-md shadow-xl flex items-center justify-center font-bold text-white text-5xl">
              <span>A</span>
            </div>
        </Box>
        <Box
            Width={17}
            Height={3}
            Position={{ x: 5, y: 0 }}
            AnchorRef={blockBRef}
          >
            <div ref={ blockBRef } className="bg-red-500 w-full h-full rounded-md shadow-xl flex items-center justify-center font-bold text-white text-5xl">
              <span>B</span>
            </div>
        </Box>
        <Box
            Width={5}
            Height={7}
            Position={{ x: 5, y: 3 }}
          >
            <div className="bg-indigo-500 w-full h-full rounded-md shadow-xl flex items-center justify-center font-bold text-white text-5xl">
              <span>C</span>
            </div>
        </Box>
        <Box
            Width={12}
            Height={7}
            Position={{ x: 10, y: 3 }}
          >
            <div className="bg-pink-500 w-full h-full rounded-md shadow-xl flex items-center justify-center font-bold text-white text-5xl">
              <span>D</span>
            </div>
        </Box>
      </Floor>
    </div>
  );
}
