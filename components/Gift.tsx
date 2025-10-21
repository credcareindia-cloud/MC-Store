const Gift = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6" />
      <line x1="12" y1="22" x2="12" y2="11" />
      <line x1="3" y1="7" x2="21" y2="7" />
    </svg>
  )
}

export default Gift
