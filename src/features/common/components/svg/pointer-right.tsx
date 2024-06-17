import type { SVGProps } from 'react'
const SvgPointerRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="20px"
    height="20px"
    preserveAspectRatio="xMinYMid meet"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M 14 16 L 20 10 L 14 4 L 16 10 L 14 16 Z" fillRule="nonzero" fill="currentColor" stroke="none" />
  </svg>
)
export default SvgPointerRight
