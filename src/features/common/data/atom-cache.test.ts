import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReadOnlyAtomAndTimestamp, createTimestamp, readOnlyAtomCache, writableAtomCache } from './atom-cache'
import { atom, Atom, Getter, SetStateAction, Setter, WritableAtom } from 'jotai'

const myStore = await vi.hoisted(async () => {
  const { createStore } = await import('jotai/index')
  return createStore()
})

vi.mock('@/features/common/data/data-store', async () => {
  const original = await vi.importActual('@/features/common/data/data-store')
  return {
    ...original,
    dataStore: myStore,
  }
})

describe('atom-cache', () => {
  const asShortId = (date: Date) => Number(date).toString(36).toUpperCase()

  afterEach(async () => {
    vi.resetAllMocks()
  })

  describe('readonly atom cache', () => {
    const atomInitialiser = (_: Getter, __: Setter, date: Date) => {
      return asShortId(date)
    }

    it('can add an item', () => {
      const now = Date.now()
      const date = new Date('2024-08-18T15:52:00Z')
      const dateEpoch = Number(date)

      const [myThingsAtom] = readOnlyAtomCache(atomInitialiser, (date) => Number(date), new Map<number, readonly [Atom<string>, number]>())

      myStore.set(myThingsAtom, (prev) => {
        const next = new Map(prev)
        next.set(dateEpoch, createReadOnlyAtomAndTimestamp(asShortId(date)))
        return next
      })

      const myThings = myStore.get(myThingsAtom)
      const [myThingAtom, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZQWA2O')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it('can get an existing item and the timestamp is updated', () => {
      const now = Date.now()
      const date = new Date('2024-08-18T16:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = readOnlyAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [Atom<string>, number]>([[dateEpoch, [atom(() => asShortId(date)), 1723999500000]]])
      )

      const myThingAtom = getMyThingAtom(date)

      const myThings = myStore.get(myThingsAtom)
      const [_, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZT1FUO')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it("initialises an item that doesn't exist", () => {
      const now = Date.now()
      const date = new Date('2024-08-18T17:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = readOnlyAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [Atom<string>, number]>()
      )

      const myThingAtom = getMyThingAtom(date)

      const myThings = myStore.get(myThingsAtom)
      const [_, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZV6LMO')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })
  })

  describe('writeable atom cache', () => {
    const atomInitialiser = (_: Getter, __: Setter, date: Date) => {
      return atom(asShortId(date))
    }

    it('can add an item', () => {
      const now = Date.now()
      const date = new Date('2024-08-18T15:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom] = writableAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [WritableAtom<string, [SetStateAction<string>], void>, number]>()
      )

      myStore.set(myThingsAtom, (prev) => {
        const next = new Map(prev)
        next.set(dateEpoch, createWritableAtomAndTimestamp(asShortId(date)))
        return next
      })

      const myThings = myStore.get(myThingsAtom)
      const [myThingAtom, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZQWA2O')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it('can get an existing item and the timestamp is updated', () => {
      const now = Date.now()
      const date = new Date('2024-08-18T16:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = writableAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [WritableAtom<string, [SetStateAction<string>], void>, number]>([
          [dateEpoch, [atom(asShortId(date)), 1723999500000]],
        ])
      )

      const myThingAtom = getMyThingAtom(date)

      const myThings = myStore.get(myThingsAtom)
      const [_, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZT1FUO')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it('can update an existing item', () => {
      const now = Date.now()
      const date = new Date('2024-08-18T16:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = writableAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [WritableAtom<string, [SetStateAction<string>], void>, number]>([
          [dateEpoch, [atom(asShortId(date)), 1723999500000]],
        ])
      )

      const myThingAtom = getMyThingAtom(date)
      myStore.set(myThingAtom, 'TESTER')

      const myThings = myStore.get(myThingsAtom)
      const [myThingAtomDirect, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtomDirect)).toBe('TESTER')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it("initialises an item that doesn't exist", () => {
      const now = Date.now()
      const date = new Date('2024-08-18T17:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = writableAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [WritableAtom<string, [SetStateAction<string>], void>, number]>()
      )

      const myThingAtom = getMyThingAtom(date)

      const myThings = myStore.get(myThingsAtom)
      const [_, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZV6LMO')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })
  })
})

const expectTimestampToBeWithinSeconds = (actualTimestamp: number, expectedTimestamp: number) => {
  expect(actualTimestamp).toBeGreaterThanOrEqual(expectedTimestamp)
  expect(actualTimestamp).toBeLessThanOrEqual(expectedTimestamp + 2_000)
}

const createWritableAtomAndTimestamp = <T>(value: T) => {
  return [atom(value, () => {}), createTimestamp()] as const
}
