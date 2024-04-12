import type { SVGProps } from 'react'
const SvgChevronLeftLine = (props: SVGProps<SVGSVGElement>) => (
  <svg width="1em" height="1em" viewBox="2 4 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18L6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export default SvgChevronLeftLine
