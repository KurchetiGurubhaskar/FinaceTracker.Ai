import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';


export function Skeleton({ className, ...props }) {
  return (
    <div
      className={twMerge(clsx("animate-pulse rounded-md bg-white/5", className))}
      {...props}
    />
  );
}
