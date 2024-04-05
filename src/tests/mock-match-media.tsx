interface MediaQueryList {
  readonly matches: boolean
  readonly media: string
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null
  /** @deprecated */
  addListener(callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null): void
  /** @deprecated */
  removeListener(callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null): void
  addEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
  removeEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void
}

type MediaQueryListener = (this: MediaQueryList, ev: MediaQueryListEvent) => void

export default class MatchMediaMock {
  private mediaQueries: {
    [key: string]: MediaQueryListener[]
  } = {}

  private mediaQueryList!: MediaQueryList

  private currentMediaQuery!: string

  constructor() {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string): MediaQueryList => {
        this.mediaQueryList = {
          matches: query === this.currentMediaQuery,
          media: query,
          onchange: null,
          addListener: (listener: MediaQueryListener) => {
            this.addListener(query, listener)
          },
          removeListener: (listener: MediaQueryListener) => {
            this.removeListener(query, listener)
          },
          addEventListener: (type: string, listener: EventListener) => {
            if (type !== 'change') return

            this.addListener(query, listener)
          },
          removeEventListener: (type: string, listener: EventListener) => {
            if (type !== 'change') return

            this.removeListener(query, listener)
          },
        }

        return this.mediaQueryList
      },
    })
  }

  /**
   * Adds a new listener function for the specified media query
   * @private
   */
  private addListener(mediaQuery: string, listener: MediaQueryListener): void {
    if (!this.mediaQueries[mediaQuery]) {
      this.mediaQueries[mediaQuery] = []
    }

    const query = this.mediaQueries[mediaQuery]
    const listenerIndex = query.indexOf(listener)

    if (listenerIndex !== -1) return
    query.push(listener)
  }

  /**
   * Removes a previously added listener function for the specified media query
   * @private
   */
  private removeListener(mediaQuery: string, listener: MediaQueryListener): void {
    if (!this.mediaQueries[mediaQuery]) return

    const query = this.mediaQueries[mediaQuery]
    const listenerIndex = query.indexOf(listener)

    if (listenerIndex === -1) return
    query.splice(listenerIndex, 1)
  }

  /**
   * Updates the currently used media query,
   * and calls previously added listener functions registered for this media query
   * @public
   */
  public useMediaQuery(mediaQuery: string): never | void {
    if (typeof mediaQuery !== 'string') throw new Error('Media Query must be a string')

    this.currentMediaQuery = mediaQuery

    if (!this.mediaQueries[mediaQuery]) return

    const mqListEvent: Partial<MediaQueryListEvent> = {
      matches: true,
      media: mediaQuery,
    }

    this.mediaQueries[mediaQuery].forEach((listener) => {
      listener.call(this.mediaQueryList, mqListEvent as MediaQueryListEvent)
    })
  }

  /**
   * Returns an array listing the media queries for which the matchMedia has registered listeners
   * @public
   */
  public getMediaQueries(): string[] {
    return Object.keys(this.mediaQueries)
  }

  /**
   * Returns a copy of the array of listeners for the specified media query
   * @public
   */
  public getListeners(mediaQuery: string): MediaQueryListener[] {
    if (!this.mediaQueries[mediaQuery]) return []
    return this.mediaQueries[mediaQuery].slice()
  }

  /**
   * Clears all registered media queries and their listeners
   * @public
   */
  public clear(): void {
    this.mediaQueries = {}
    this.currentMediaQuery = ''
  }

  /**
   * Clears all registered media queries and their listeners,
   * and destroys the implementation of `window.matchMedia`
   * @public
   */
  public destroy(): void {
    this.clear()
  }
}
