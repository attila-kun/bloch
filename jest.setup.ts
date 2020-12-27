import { Complex, equal, exp } from "mathjs";

expect.extend({
  toEqualComplex(received: Complex, expected: number|Complex) {
    return {
      pass: !!equal(received, expected),
      message: () => `Received: ${received}\nExpected: ${expected}`
    };
  }
});