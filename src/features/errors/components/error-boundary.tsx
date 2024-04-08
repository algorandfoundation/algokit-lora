import { Component, ErrorInfo, PropsWithChildren } from 'react'

type ErrorBoundaryProps = PropsWithChildren

function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryImpl {...{ ...props }} />
}

type ErrorBoundaryImplProps = ErrorBoundaryProps
type ErrorBoundaryImplState = {
  errorType: ErrorType
}

enum ErrorType {
  None,
  Other,
}

class ErrorBoundaryImpl extends Component<ErrorBoundaryImplProps, ErrorBoundaryImplState> {
  constructor(props: ErrorBoundaryImplProps) {
    super(props)

    this.state = {
      errorType: ErrorType.None,
    }
  }

  public static getDerivedStateFromError(_e: unknown): ErrorBoundaryImplState {
    return {
      errorType: ErrorType.Other,
    }
  }

  public async componentDidCatch(_e: unknown, _errorInfo: ErrorInfo) {}

  public componentDidUpdate() {}

  public render() {
    if (this.state.errorType === ErrorType.None) {
      return this.props.children
    }

    return <p>Error</p>
  }
}

export default ErrorBoundary
