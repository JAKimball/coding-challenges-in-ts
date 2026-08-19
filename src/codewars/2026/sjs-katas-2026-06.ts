import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

export class PaginationHelper {
  private _itemCount: number
  private _itemsPerPage: number

  public constructor(collection: unknown[], itemsPerPage: number) {
    // The constructor takes in an array of items and a integer indicating how many
    // items fit within a single page
    this._itemCount = collection.length
    this._itemsPerPage = itemsPerPage
  }

  public itemCount(): number {
    // returns the number of items within the entire collection
    return this._itemCount
  }

  public pageCount(): number {
    // returns the number of pages
    return Math.ceil(this._itemCount / this._itemsPerPage)
  }

  public pageItemCount(pageIndex: number): number {
    // returns the number of items on the current page. page_index is zero based.
    // this method should return -1 for pageIndex values that are out of range
    if (pageIndex < 0 || pageIndex >= this.pageCount()) return -1
    if (pageIndex === this.pageCount() - 1) return ((this._itemCount - 1) % this._itemsPerPage) + 1
    else return this._itemsPerPage
  }

  public pageIndex(itemIndex: number): number {
    // determines what page an item is on. Zero based indexes
    // this method should return -1 for itemIndex values that are out of range
    if (itemIndex < 0 || itemIndex >= this._itemCount) return -1
    return Math.floor(itemIndex / this._itemsPerPage)
  }
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest

  describe('Tests suite', () => {
    it('sample test : 24 items with 10 per page', () => {
      const collection = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
      ]
      const helper = new PaginationHelper(collection, 10)

      assert.strictEqual(helper.pageCount(), 3, 'pageCount()')
      assert.strictEqual(helper.itemCount(), 24, 'itemCount()')

      assert.strictEqual(helper.pageItemCount(1), 10, 'pageItemCount(1)')
      assert.strictEqual(helper.pageItemCount(2), 4, 'pageItemCount(2)')
      assert.strictEqual(helper.pageItemCount(3), -1, 'pageItemCount(3)')

      assert.strictEqual(helper.pageIndex(40), -1, 'pageItemCount(40)')
      assert.strictEqual(helper.pageIndex(22), 2, 'pageItemCount(22)')
      assert.strictEqual(helper.pageIndex(3), 0, 'pageItemCount(3)')
      assert.strictEqual(helper.pageIndex(0), 0, 'pageItemCount(0)')
      assert.strictEqual(helper.pageIndex(-1), -1, 'pageItemCount(-1)')
      assert.strictEqual(helper.pageIndex(-23), -1, 'pageItemCount(-23)')
      assert.strictEqual(helper.pageIndex(-15), -1, 'pageItemCount(-15)')
    })

    it('empty collection', () => {
      const helper = new PaginationHelper([], 10)

      assert.strictEqual(helper.pageCount(), 0, 'pagecount()')
      assert.strictEqual(helper.itemCount(), 0, 'itemCount()')
      assert.strictEqual(helper.pageIndex(0), -1, 'pageIndex(0)')
      assert.strictEqual(helper.pageItemCount(0), -1, 'pageItemCount(0)')
    })

    function randInt(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    describe('random tests', () => {
      for (let i = 0; i < 100; i++) {
        const itemCount = randInt(0, 100)
        const itemsPerPage = randInt(1, itemCount * 2)
        const pagesCount = Math.ceil(itemCount / itemsPerPage)

        const helper = new PaginationHelper(Array(itemCount), itemsPerPage)

        it(`for itemCount = ${itemCount} itemsPerPage = ${itemsPerPage}`, function () {
          assert.strictEqual(helper.pageCount(), pagesCount, 'pageCount')
          assert.strictEqual(helper.itemCount(), itemCount, 'itemCount')

          for (let i = 0; i < 5; i++) {
            const pageIndex = randInt(-2, pagesCount + 3)

            let pageItemCount
            if (pageIndex < 0 || pageIndex >= pagesCount) pageItemCount = -1
            else if (pageIndex === pagesCount - 1)
              // last page
              pageItemCount = itemCount % itemsPerPage || itemsPerPage
            else pageItemCount = itemsPerPage

            assert.strictEqual(helper.pageItemCount(pageIndex), pageItemCount, 'pageItemCount')
          }

          for (let i = 0; i < 5; i++) {
            const itemIndex = randInt(-2, itemCount + 5)
            const pageIndex =
              itemIndex < 0 || itemIndex >= itemCount ? -1 : Math.floor(itemIndex / itemsPerPage)

            assert.strictEqual(helper.pageIndex(itemIndex), pageIndex, 'pageIndex')
          }
        })
      }
    })
  })
}

/***************************
 * Example test template
 */

// cspell:disable
export function isTriangle(a: number, b: number, c: number): boolean {
  const sum = a + b + c
  return sum - 2 * Math.max(a, b, c) > 0
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('isTriangle tests', () => {
    it('should pass basic tests', () => {
      expect(isTriangle(1, 2, 2)).toBe(true)
      expect(isTriangle(7, 2, 2)).toBe(false)
      expect(isTriangle(1, 2, 3)).toBe(false)
    })
  })
}
// cspell:enable
