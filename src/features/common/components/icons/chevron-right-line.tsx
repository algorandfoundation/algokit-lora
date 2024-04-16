import type { SVGProps } from 'react'
const SvgChevronRightLine = (props: SVGProps<SVGSVGElement>) => (
  <svg width="1em" height="1em" viewBox="6 4 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 6L18 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export default SvgChevronRightLine
