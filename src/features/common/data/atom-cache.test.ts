import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReadOnlyAtomAndTimestamp, createTimestamp, readOnlyAtomCache, writableAtomCache } from './atom-cache'
import { atom, Atom, Getter, SetStateAction, Setter, WritableAtom } from 'jotai'
import { shortId } from '@/utils/short-id'
import { getTestStore } from '@/tests/utils/get-test-store'

describe('atom-cache', () => {
  afterEach(async () => {
    vi.resetAllMocks()
  })

  describe('readonly atom cache', () => {
    const atomInitialiser = (_: Getter, __: Setter, date: Date) => {
      return shortId(date)
    }

    it('can add an item', () => {
      const myStore = getTestStore()
      const now = Date.now()
      const date = new Date('2024-08-18T15:52:00Z')
      const dateEpoch = Number(date)

      const [myThingsAtom] = readOnlyAtomCache(atomInitialiser, (date) => Number(date), new Map<number, readonly [Atom<string>, number]>())

      myStore.set(myThingsAtom, (prev) => {
        const next = new Map(prev)
        next.set(dateEpoch, createReadOnlyAtomAndTimestamp(shortId(date)))
        return next
      })

      const myThings = myStore.get(myThingsAtom)
      const [myThingAtom, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZQWA2O')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it('can get an existing item and the timestamp is updated', () => {
      const myStore = getTestStore()
      const now = Date.now()
      const date = new Date('2024-08-18T16:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = readOnlyAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [Atom<string>, number]>([[dateEpoch, [atom(() => shortId(date)), 1723999500000]]])
      )

      const myThingAtom = getMyThingAtom(date)

      const myThings = myStore.get(myThingsAtom)
      const [_, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZT1FUO')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it("initialises an item that doesn't exist", () => {
      const myStore = getTestStore()
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

    it('can get an item that throws without caching', () => {
      const myStore = getTestStore()
      const fails = 'fails'
      const success = 'success'

      let initialiserCallCount = 0
      const atomInitialiser = (_: Getter, __: Setter, arg: string): string => {
        initialiserCallCount++

        if (arg === fails) {
          throw new Error('Boom')
        }

        return arg
      }

      const [_, getMyThing] = readOnlyAtomCache(atomInitialiser, (arg) => arg)

      expect(() => myStore.get(getMyThing(fails))).toThrow('Boom')
      expect(() => myStore.get(getMyThing(fails))).toThrow('Boom')
      expect(myStore.get(getMyThing(success))).toBe(success)
      expect(() => myStore.get(getMyThing(fails))).toThrow('Boom')
      expect(myStore.get(getMyThing(success))).toBe(success)

      expect(initialiserCallCount).toBe(4)
    })

    it('can get an async item that throws without caching', async () => {
      const myStore = getTestStore()
      const fails = 'fails'
      const success = 'success'

      let initialiserCallCount = 0
      const asyncAtomInitialiser = (_: Getter, __: Setter, arg: string): Promise<string> => {
        initialiserCallCount++

        if (arg === fails) {
          throw new Error('Boom')
        }

        return Promise.resolve(arg)
      }

      const [_, getMyThing] = readOnlyAtomCache(asyncAtomInitialiser, (arg) => arg)

      await expect(async () => await myStore.get(getMyThing(fails))).rejects.toThrow('Boom')
      await expect(async () => await myStore.get(getMyThing(fails))).rejects.toThrow('Boom')
      expect(await myStore.get(getMyThing(success))).toBe(success)
      await expect(async () => await myStore.get(getMyThing(fails))).rejects.toThrow('Boom')
      expect(await myStore.get(getMyThing(success))).toBe(success)

      expect(initialiserCallCount).toBe(4)
    })
  })

  describe('writeable atom cache', () => {
    const myStore = getTestStore()
    const atomInitialiser = (_: Getter, __: Setter, date: Date) => {
      return atom(shortId(date))
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
        next.set(dateEpoch, createWritableAtomAndTimestamp(shortId(date)))
        return next
      })

      const myThings = myStore.get(myThingsAtom)
      const [myThingAtom, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZQWA2O')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it('can get an existing item and the timestamp is updated', () => {
      const myStore = getTestStore()
      const now = Date.now()
      const date = new Date('2024-08-18T16:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = writableAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [WritableAtom<string, [SetStateAction<string>], void>, number]>([
          [dateEpoch, [atom(shortId(date)), 1723999500000]],
        ])
      )

      const myThingAtom = getMyThingAtom(date)

      const myThings = myStore.get(myThingsAtom)
      const [_, myThingTimestamp] = myThings.get(dateEpoch)!
      expect(myStore.get(myThingAtom)).toBe('LZZT1FUO')
      expectTimestampToBeWithinSeconds(myThingTimestamp, now)
    })

    it('can update an existing item', () => {
      const myStore = getTestStore()
      const now = Date.now()
      const date = new Date('2024-08-18T16:52:00Z')
      const dateEpoch = Number(date)
      const [myThingsAtom, getMyThingAtom] = writableAtomCache(
        atomInitialiser,
        (date) => Number(date),
        new Map<number, readonly [WritableAtom<string, [SetStateAction<string>], void>, number]>([
          [dateEpoch, [atom(shortId(date)), 1723999500000]],
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
      const myStore = getTestStore()
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
