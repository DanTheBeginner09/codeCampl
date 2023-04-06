import React from 'react';

const Padding = Object.freeze({
  small: 5,
  medium: 15,
  large: 30,
  exLarge: 45
});

type PaddingKeys = keyof typeof Padding;
interface SpacerProps {
  size: PaddingKeys;
  children?: JSX.Element;
}

const Spacer = ({ size, children }: SpacerProps): JSX.Element => (
  <div
    className='spacer'
    style={{
      padding: `${Padding[size]}px 0`
    }}
  >
    {children}
  </div>
);

export default Spacer;
