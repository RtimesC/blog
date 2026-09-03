import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const gradientLayers = [
  { animationDelay: '0s', animationDuration: '25s' },
  { animationDelay: '0.15s', animationDuration: '15.9s' },
  { animationDelay: '0.53s', animationDuration: '26.4s' },
  { animationDelay: '0.45s', animationDuration: '17.8s' },
  { animationDelay: '1.6s', animationDuration: '19.2s' },
  { animationDelay: '1.6s', animationDuration: '29.2s' },
  { animationDelay: '1.6s', animationDuration: '20.2s' },
];

const buttonVariants = cva(
  'gradient-btn',
  {
    variants: {
      variant: {
        default: '',
        destructive: '',
        outline: '',
        secondary: '',
        ghost: '',
        link: '',
      },
      size: {
        default: '',
        sm: 'gradient-btn--sm',
        lg: 'gradient-btn--lg',
        icon: 'gradient-btn--icon',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({ children, className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  const buttonClassName = cn(buttonVariants({ variant, size, className }));
  const wrapperClassName = cn('btn-wrapper', size === 'sm' && 'btn-wrapper--sm', size === 'lg' && 'btn-wrapper--lg');

  return (
    <div className={wrapperClassName}>
      <div className="light" aria-hidden="true" />
      {gradientLayers.map((style, index) => (
        <div className="gradient-layer" aria-hidden="true" key={index} style={style} />
      ))}
      <Comp className={buttonClassName} {...props}>
        {children}
      </Comp>
      <div className="text-overlay" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

export { Button };
