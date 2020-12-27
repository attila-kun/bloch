import { Complex } from "mathjs";

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualComplex(value: number|Complex): CustomMatcherResult;
    }
  }
}