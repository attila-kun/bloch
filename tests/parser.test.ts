import Calc from '../src/parser';

describe("latex parser", function() {

  [
    {
      expr: "2+2",
      expectation: 4
    },
    {
      expr: "(2+2)*3",
      expectation: 12
    },
    {
      expr: "2^3",
      expectation: 8
    },
    {
      expr: "2^(3+4+5)",
      expectation: 4096
    },
    {
      expr: "2^{3+4+5}",
      expectation: 4096
    }
  ].forEach(testCase => {
    it(`parses expression ${testCase.expr}`, function() {
      expect(new Calc(testCase.expr).eval()).toBe(testCase.expectation);
    });
  });
});