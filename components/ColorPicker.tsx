"use client";

import React, { useState } from "react";
import { BlockPicker } from "react-color";

export default function ColorPicker({
  color,
  setColor,
}: {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (newColor: any) => {
    setColor(newColor.hex);
  };

  return (
    <div className="relative">
      {/* Container for the swatch */}
      <div
        className="w-9 h-9 rounded-md cursor-pointer"
        onClick={handleClick}
        style={{
          backgroundColor: `${color}`,
        }}
      ></div>

      {/* Color picker popover */}
      {displayColorPicker ? (
        <div className="absolute z-[2] top-10 sm:-right-16 right-0">
          {/* Cover overlay */}
          <div className="fixed inset-0" onClick={handleClose} />
          <BlockPicker color={color} onChange={handleChange} triangle="hide" />
        </div>
      ) : null}
    </div>
  );
}
