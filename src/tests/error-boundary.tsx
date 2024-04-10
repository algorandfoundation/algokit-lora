import { asError } from '@/utils/error'
import { Component, ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children?: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, { error?: Error }> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {}
  }

  static getDerivedStateFromError(error: unknown) {
    return { error: asError(error) }
  }

  render() {
    if (this.state.error) {
      return <p>{this.state.error.message}</p>
    }
    return this.props.children
  }
}
