import React, { useEffect } from 'react';

interface ConfettiProps {
  trigger?: boolean;
}

export const ConfettiEffect: React.FC<ConfettiProps> = ({ trigger = true }) => {
  if (!trigger) return null;
  return null;
};
