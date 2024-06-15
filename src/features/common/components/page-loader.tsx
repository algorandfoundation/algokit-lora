import { Loader2 as Loader } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="m-0 flex flex-col items-center justify-center">
      <Loader className="size-16 animate-spin" />
      <span className="mt-2">Loading...</span>
    </div>
  )
}
