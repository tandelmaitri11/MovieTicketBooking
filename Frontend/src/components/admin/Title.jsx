import React from "react";

const Title = ({ text1, text2, subtitle }) => {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-100">
        {text1}{" "}
        <span className="relative text-primary">
          {text2}
          <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary/60 rounded-full" />
        </span>
      </h1>

      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

export default Title;
