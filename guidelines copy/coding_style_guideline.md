# typescript

- avoid 'else' statement. use another if statements to clarify

  ```typescript
  // must be empty line before
  if (statement) {
    return;
  }
  if (!statement) {
    // instead of else
  }
  ```

- use early return
- don't use one line if state and return
  - should do always
  ```typescript
  // must be empty line before
  if (statement) {
    return;
  }
  ```
- don't use for loop unless there is other method.s

  - use Promise.all , BPromise.map, BPromise.map series
  - use array methods like forEach, map, filter, reduce, every, some and et

  ```typescript
  /**
   * instead of
   * for (const a of b) {}
   **/

  b.forEach(() => {});
  b.filter(() => {});
  b.map(() => {});

  BPromise.map(b, async (item) => {});
  BPromise.mapSeries(b, async (item) => {});
  ```

- use switch cae instead of if else statement
  ```typescript
  switch (type) {
    case A:
    case B:
    case C:
    default:
  }
  ```

# React

- don't define component inside of a component. component function must be in file scope level.
