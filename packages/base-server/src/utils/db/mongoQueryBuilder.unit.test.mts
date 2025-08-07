import { describe, expect, test } from '@jest/globals';

import mongoQueryBuilder from './mongoQueryBuilder.mts';

describe('mongo query builder', () => {
  describe('buildAddToSetUpdateQuery', () => {
    test('Build query from 1 depth object', () => {
      const updateData = {
        array: ['a'],
        string: 'test',
        number: 1,
      };
      const builtQuery = mongoQueryBuilder.buildAddToSetUpdateQuery(updateData);
      expect(builtQuery).toStrictEqual({
        array: { $each: ['a'] },
        string: 'test',
        number: 1,
      });
    });

    test('Build query from 2 depth object', () => {
      const updateData = {
        activities: {
          array: ['a'],
          string: 'test',
          number: 1,
        },
      };
      const builtQuery = mongoQueryBuilder.buildAddToSetUpdateQuery(updateData);
      expect(builtQuery).toStrictEqual({
        'activities.array': { $each: ['a'] },
        'activities.string': 'test',
        'activities.number': 1,
      });
    });
  });

  describe('buildSetUpdateQuery', () => {
    test('Build query from 1 depth object', () => {
      const now = new Date();
      const updateData = {
        array: ['a'],
        string: 'test',
        number: 1,
        date: now,
      };
      const builtQuery = mongoQueryBuilder.buildSetUpdateQuery(updateData);
      expect(builtQuery).toStrictEqual({
        array: ['a'],
        string: 'test',
        number: 1,
        date: now,
      });
    });

    test('Build query from 2 depth object', () => {
      const now = new Date();
      const updateData = {
        activities: {
          array: ['a'],
          string: 'test',
          number: 1,
          date: now,
        },
      };
      const builtQuery = mongoQueryBuilder.buildSetUpdateQuery(updateData);
      expect(builtQuery).toStrictEqual({
        'activities.array': ['a'],
        'activities.string': 'test',
        'activities.number': 1,
        'activities.date': now,
      });
    });
  });
});
