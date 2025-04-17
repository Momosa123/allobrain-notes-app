// frontend/components/ui/IconButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { ButtonHTMLAttributes } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LucideProps } from 'lucide-react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<LucideProps>; // Type for the Lucid icon
  tooltipContent: React.ReactNode;
  srText: string; // Text for screen readers
  iconClassName?: string;
}

const IconButton = ({
  icon: Icon,
  tooltipContent,
  srText,
  iconClassName,
  disabled,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={disabled ? 'cursor-not-allowed' : ''}>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label={srText}
            className={cn('cursor-pointer', className)}
            {...props}
          >
            <Icon className={iconClassName || 'size-4'} />
          </Button>
        </span>
      </TooltipTrigger>

      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
};

export default IconButton;
