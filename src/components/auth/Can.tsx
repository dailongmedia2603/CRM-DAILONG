import { useAbility } from '@/context/AbilityProvider';
import React from 'react';

interface CanProps {
  I: string;
  children: React.ReactNode;
}

export const Can = ({ I, children }: CanProps) => {
  const { can } = useAbility();

  return can(I) ? <>{children}</> : null;
};