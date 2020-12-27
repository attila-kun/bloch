import { Complex, complex, equal, pi } from 'mathjs';
import Calc from '../src/parser';

describe("latex parser", function() {

  [
    {
      expr: "2+3",
      expectation: 5
    },
    {
      expr: "10/5",
      expectation: 2
    },
    {
      expr: "15/(3+2)",
      expectation: 3
    },
    {
      expr: "(15+5)/(3+2)",
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
    },
    {
      expr: "i",
      expectation: complex(0, 1)
    },
    {
      expr: "2i",
      expectation: complex(0, 2)
    },
    {
      expr: "i2",
      expectation: complex(0, 2)
    },
    {
      expr: "e^{i*pi}",
      expectation: -1
    },
    {
      expr: "e^{i*pi/2}",
      expectation: complex(0, 1)
    },
    {
      expr: "e^{i*pi*3/2}",
      expectation: complex(0, -1)
    },
  ].forEach(testCase => {
    it(`parses expression ${testCase.expr}`, function() {
      expect(new Calc(testCase.expr).eval()).toEqualComplex(testCase.expectation);
    });
  });

  [
    {
      expr: "2x",
      x: 3,
      expectation: 6
    },
    {
      expr: "2x",
      x: 4,
      expectation: 8
    }
  ].forEach(testCase => {
    it(`parses expression with variable ${testCase.expr}`, function() {
      expect(new Calc(testCase.expr).eval(testCase.x)).toBe(testCase.expectation);
    });
  });
});