import { createSelector } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';
import { RootState } from './index';

export const selectItems = (state: RootState) => state.workspace.items;

// Memoized selector that only returns new array if keys actually changed
export const selectItemIds = createSelector(
  [selectItems],
  (items) => Object.keys(items),
  {
    memoizeOptions: {
      resultEqualityCheck: equal
    }
  }
);

