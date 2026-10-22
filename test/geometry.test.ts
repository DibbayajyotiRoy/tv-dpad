import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nearest, type Rect } from '../dist/index.js';

const box = (left: number, top: number, w = 100, h = 50): Rect => ({ left, top, right: left + w, bottom: top + h });

// 0 1 2
// 3 4 5
const grid = [0, 1, 2, 3, 4, 5].map((i) => box((i % 3) * 120, Math.floor(i / 3) * 70));

test('moves to the neighbour in each direction', () => {
  assert.equal(nearest(grid[4], grid, 'ArrowLeft'), 3);
  assert.equal(nearest(grid[4], grid, 'ArrowRight'), 5);
  assert.equal(nearest(grid[4], grid, 'ArrowUp'), 1);
  assert.equal(nearest(grid[1], grid, 'ArrowDown'), 4);
});

test('returns -1 at an edge', () => {
  assert.equal(nearest(grid[0], grid, 'ArrowLeft'), -1);
  assert.equal(nearest(grid[0], grid, 'ArrowUp'), -1);
  assert.equal(nearest(grid[5], grid, 'ArrowDown'), -1);
});

test('a full-width row beats a closer, narrow neighbour off to the side', () => {
  const list = [box(500, 55, 100, 50), box(0, 60, 1000, 50)]; // narrow & near, full-width & in line
  assert.equal(nearest(box(0, 0), list, 'ArrowDown'), 1);
});
