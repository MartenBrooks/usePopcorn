import { useState } from 'react';
export default function TextExpander({
  children,
  collapsedNumWords = 10,
  expandButtonText = 'Show more',
  collapseButtonText = 'Show less',
  buttonColor = '#1f09cd',
  defaultOpen = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const closedContent = `${children
    .split(' ')
    .slice(0, collapsedNumWords)
    .join(' ')}...`;
  const content = isOpen ? children : closedContent;
  const buttonStyle = {
    marginLeft: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1em',
    font: 'inherit',
    color: buttonColor,
  };
  function toggleOpen() {
    setIsOpen((open) => !open);
  }
  return (
    <div className={className}>
      <span>{content}</span>
      <button onClick={toggleOpen} style={buttonStyle}>
        {isOpen ? collapseButtonText : expandButtonText}
      </button>
    </div>
  );
}
