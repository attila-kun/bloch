import { calculateEigenVectors, createUnitary, EigenVector, IDENTITY, Matrix2x2, PAULI_X, PAULI_Y, PAULI_Z } from './../src/eigen';
import * as  mathjs from 'mathjs';

function assertVector(
  vector: EigenVector,
  expectation: EigenVector
) {
  expect(vector[0].re).toBeCloseTo(expectation[0].re);
  expect(vector[0].im).toBeCloseTo(expectation[0].im);
  expect(vector[1].re).toBeCloseTo(expectation[1].re);
  expect(vector[1].im).toBeCloseTo(expectation[1].im);
}

describe('calculate eigenvectors', function() {

  type TestCase = {description: string, matrix: Matrix2x2, expectation: { vector1: EigenVector, vector2: EigenVector}};

  ([
    {
      description: "Identity",
      matrix: IDENTITY,
      expectation: {
        vector1: [mathjs.complex(1, 0), mathjs.complex(0, 0)],
        vector2: [mathjs.complex(0, 0), mathjs.complex(1, 0)]
      }
    },
    {
      description: "Pauli-X",
      matrix: PAULI_X,
      expectation: {
        vector1: [mathjs.complex(mathjs.sqrt(1/2), 0), mathjs.complex(mathjs.sqrt(1/2), 0)],
        vector2: [mathjs.complex(mathjs.sqrt(1/2), 0), mathjs.complex(mathjs.multiply(-1, mathjs.sqrt(1/2)), 0)]
      }
    },
    {
      description: "Pauli-Y",
      matrix: PAULI_Y,
      expectation: {
        vector1: [mathjs.complex(mathjs.sqrt(1/2), 0), mathjs.complex(0, mathjs.sqrt(1/2))],
        vector2: [mathjs.complex(mathjs.sqrt(1/2), 0), mathjs.complex(0, mathjs.multiply(-1, mathjs.sqrt(1/2)))]
      }
    },
    {
      description: "Pauli-Z",
      matrix: PAULI_Z,
      expectation: {
        vector1: [mathjs.complex(1, 0), mathjs.complex(0, 0)],
        vector2: [mathjs.complex(0, 0), mathjs.complex(1, 0)]
      }
    },
    {
      description: "Hadamard",
      matrix: [
        [mathjs.sqrt(1/2), mathjs.sqrt(1/2)],
        [mathjs.sqrt(1/2), mathjs.multiply(-1, mathjs.sqrt(1/2))]
      ],
      expectation: {
        vector1: [mathjs.complex(0.9238795325112867, 0), mathjs.complex(0.3826834323650897, 0)],
        vector2: [mathjs.complex(0.38268343236508984, 0), mathjs.complex(-0.9238795325112867, 0)]
      }
    }
  ] as TestCase[]).forEach(testCase => {

    it(testCase.description, function() {
      const {vector1, vector2} = calculateEigenVectors(testCase.matrix);
      assertVector(vector1, testCase.expectation.vector1);
      assertVector(vector2, testCase.expectation.vector2);
    })

  })

  it.only('hello', function() {
    // const M = createUnitary(mathjs.pi/1.5, mathjs.multiply(-1, mathjs.sqrt(4/10)), mathjs.multiply(1, mathjs.sqrt(2/10)), mathjs.multiply(-1, mathjs.sqrt(4/10)));
    const M = createUnitary(mathjs.multiply(1, mathjs.pi), mathjs.sqrt(1/2), 0, mathjs.sqrt(1/2));
    // const M = createUnitary(mathjs.pi, 1, 0, 0);
//
    const plus = mathjs.multiply(M, [1, 0]);
    console.log('M', M);
    console.log('plus', plus);

    const {vector1, vector2} = calculateEigenVectors(M);
//
    const a: mathjs.Complex = vector1[0];
    const b: mathjs.Complex = vector1[1];
    const c: mathjs.Complex = vector2[0];
    const d: mathjs.Complex = vector2[1];
    const offDiagonal = mathjs.subtract(mathjs.multiply(c, mathjs.conj(d)), mathjs.multiply(a, mathjs.conj(b))) as mathjs.Complex;
    const x = offDiagonal.re;
    const y = -1 * offDiagonal.im;
    const z = (mathjs.norm(c) as number)**2 - (mathjs.norm(a) as number)**2;
    console.log('x', x);
    console.log('y', y);
    console.log('z', z);

    // console.log('matrix', M);
    // console.log('vector1', vector1, 'vector2', vector2);
  });
});