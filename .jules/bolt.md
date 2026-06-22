## 2024-05-24 - Prevented expensive re-renders in ThreeCanvas
**Learning:** The `ThreeCanvas` component was re-rendering unnecessarily when chat messages were sent because `App.tsx` state was changing and the props weren't properly memoized.
**Action:** Used `React.memo` for `ThreeCanvas` and stabilized its props using `useCallback` with the functional state update pattern (`setState(prev => ...)`). Moved the `generateHash` function outside the component body.
