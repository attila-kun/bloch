import * as  mathjs from 'mathjs';

type MatrixElement = number | mathjs.Complex;
export type Matrix2x2 = mathjs.MathArray & [[MatrixElement, MatrixElement], [MatrixElement, MatrixElement]];
export type EigenVector = [mathjs.Complex, mathjs.Complex];

function isBasisVectorEigen(matrix: Matrix2x2): boolean {
    const result = mathjs.multiply(matrix, [1, 0]);
    return !!mathjs.equal(result[1] as mathjs.MathType, 0);
}

export function calculateEigenVectors(matrix: Matrix2x2): { vector1: EigenVector, vector2: EigenVector } {

    if (isBasisVectorEigen(matrix)) {
        return {
            vector1: [mathjs.complex(1, 0), mathjs.complex(0, 0)],
            vector2: [mathjs.complex(0, 0), mathjs.complex(1, 0)]
        };
    }

    const m00 = matrix[0][0] as mathjs.Complex;
    const m01 = matrix[0][1] as mathjs.Complex;
    const m10 = matrix[1][0] as mathjs.Complex;
    const m11 = matrix[1][1] as mathjs.Complex;

    const a = m01;
    const b = mathjs.subtract(m00, m11);
    const c = mathjs.multiply(-1, m10);
    const d = mathjs.sqrt(mathjs.subtract(mathjs.multiply(b, b), mathjs.multiply(mathjs.multiply(4, a), c)) as mathjs.Complex);

    const calculateRatio = (coefficient: 1 | -1) => {
        const dWithFactor = mathjs.multiply(d, coefficient);
        return mathjs.divide(mathjs.add(mathjs.multiply(-1, b), dWithFactor), mathjs.multiply(2, a));
    }

    const ratio1: mathjs.Complex = mathjs.complex(calculateRatio(1) as any);
    const ratio2: mathjs.Complex = mathjs.complex(calculateRatio(-1) as any);

    function calculateEigenVector(ratio: mathjs.Complex): [mathjs.Complex, mathjs.Complex] {
        const polar: mathjs.PolarCoordinates = ratio.toPolar();
        const phase: mathjs.Complex = mathjs.exp(mathjs.complex(0, polar.phi));
        const theta = mathjs.atan(polar.r);
        const x = mathjs.complex(mathjs.cos(theta), 0);
        const y = mathjs.multiply(mathjs.sin(theta), phase) as mathjs.Complex;
        return [x, y];
    };

    return {
        vector1: calculateEigenVector(ratio1),
        vector2: calculateEigenVector(ratio2)
    };
};

export const IDENTITY: Matrix2x2 = [
    [1, 0],
    [0, 1]
];

export const PAULI_X: Matrix2x2 = [
    [0, 1],
    [1, 0]
];

export const PAULI_Y: Matrix2x2 = [
    [mathjs.complex(0, 0), mathjs.complex(0, -1)],
    [mathjs.complex(0, 1), mathjs.complex(0, 0)]
];

export const PAULI_Z: Matrix2x2 = [
    [1, 0],
    [0, -1]
];

// This implements Nielsen & Chuang equation 4.8
export function createUnitary(theta: number, x: number, y: number, z: number): Matrix2x2 {

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