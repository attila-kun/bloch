import { calculateEigenVectors, calculateOriantation, EigenVector, IDENTITY, Matrix2x2, PAULI_X, PAULI_Y, PAULI_Z } from './../src/eigen';
import * as  mathjs from 'mathjs';
import { matrix } from 'mathjs';

// This implements Nielsen & Chuang equation 4.8
function createUnitary(theta: number, x: number, y: number, z: number): Matrix2x2 {

  const H = mathjs.add(
      mathjs.add(mathjs.multiply(x, PAULI_X as any), mathjs.multiply(y, PAULI_Y as any)),
      mathjs.multiply(z, PAULI_Z as any)
  );
  return mathjs.add(
      mathjs.multiply(mathjs.cos(theta/2), IDENTITY as any),
      mathjs.multiply(
          mathjs.multiply(mathjs.complex(0, -1), mathjs.sin(theta/2)),
          H
      )
  ) as Matrix2x2;
}

function assertVector(
  vector: EigenVector,
  expectation: EigenVector
) {
  expect(vector[0].re).toBeCloseTo(expectation[0].re);
  expect(vector[0].im).toBeCloseTo(expectation[0].im);
  expect(vector[1].re).toBeCloseTo(expectation[1].re);
  expect(vector[1].im).toBeCloseTo(expectation[1].im);
}

describe("calculate eigenvectors", function() {

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
});

describe("calculate orientation", function() {

  [
    {
      matrix: createUnitary(mathjs.pi/2, 1, 0, 0),
      x: 1,
      y: 0,
      z: 0,
      rotationAngle: mathjs.pi/2
    },
    {
      matrix: createUnitary(-mathjs.pi/2, 1, 0, 0),
      x: -1,
      y: 0,
      z: 0,
      rotationAngle: mathjs.pi/2
    },
    {
      matrix: createUnitary(mathjs.pi/2, 0, 1, 0),
      x: 0,
      y: 1,
      z: 0,
      rotationAngle: mathjs.pi/2
    },
    {
      matrix: createUnitary(-mathjs.pi/2, 0, 1, 0),
      x: 0,
      y: -1,
      z: 0,
      rotationAngle: mathjs.pi/2
    },
    {
      matrix: createUnitary(mathjs.pi/2, 0, 0, 1),
      x: 0,
      y: 0,
      z: 1,
      rotationAngle: mathjs.pi/2
    },
    {
      matrix: createUnitary(-mathjs.pi/2, 0, 0, 1),
      x: 0,
      y: 0,
      z: -1,
      rotationAngle: mathjs.pi/2
    }
  ].forEach(testCase => {

    it(`matrix with orientation: x=${testCase.x}, y=${testCase.y}, z=${testCase.z}, rotationAngle=${testCase.rotationAngle}`, function() {

      const { x, y, z, rotationAngle } = calculateOriantation(testCase.matrix);

      // console.log('x', x);
      // console.log('y', y);
      // console.log('z', z);
      // console.log('theta', rotationAngle);

      expect(x).toBeCloseTo(testCase.x);
      expect(y).toBeCloseTo(testCase.y);
      expect(z).toBeCloseTo(testCase.z);
      expect(rotationAngle).toBeCloseTo(testCase.rotationAngle);
    });

  });
});