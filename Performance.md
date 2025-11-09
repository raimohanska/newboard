## Performance optimizations

1. Make sure your root component is not re-rendered unnecessarily. In this case, Canvas must not re-render when a Note is moved. For this, it must only use the list of item ids from the store.
2. Make sure your memoizations actually take effect. It's all too easy to imagine they work, while everything actually gets re-rendered because, for instance, two arrays are not equal by `===` even if they have the same contents etc. Use `fast-deep-equal` or similar for comparing objects. In Redux, you can use `createSelector` with `memoizeOptions`.


## Performance measurements

Make sure your optimizations actually work! It's not enough to think they work. You need to verify.

1. Create an easy way to populate your application with a meaningfully large set of data. Now you can see how it performs in realistic worst case.
2. Measure before optimization. Repeat the measurement after optimization to verify it took effect.
3. For React components, create a simple render counter so you can observe how often a component is rendered.
4. Add automatic tests that assert render counts, so that you won't accidentally break performance optimizations. You can make your renderCounts object visible to your tests by exporting it to the Window object.