import type { SVGProps } from 'react'
const SvgClaw = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-paw-print"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs />
    <circle cx={11} cy={4} r={2} />
    <circle cx={18} cy={8} r={2} />
    <circle cx={20} cy={16} r={2} />
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    <path
      strokeWidth={1}
      fill="currentColor"
      d="M 11.584 1.639 C 13.015 1.191 17.355 0.694 16.079 1.481 C 15.194 2.027 14.372 2.309 13.734 3.188"
    />
    <path strokeWidth={1} fill="currentColor" d="M 19.33 5.755 C 22.279 4.832 22.736 4.654 20.623 7.461" />
    <path strokeWidth={1} fill="currentColor" d="M 21.515 13.649 C 23.224 13.225 23.573 12.941 22.569 14.781" />
  </svg>
)
export default SvgClaw
