// @ts-nocheck
import * as  mathjs from 'mathjs';

declare module 'mathjs' {
    interface MathJsStatic {
        equal: (v1: UnitVector, v2: UnitVector) => [boolean, boolean];
    }
}

type MatrixElement = number | mathjs.Complex;
export type Matrix2x2 = mathjs.MathArray & [[MatrixElement, MatrixElement], [MatrixElement, MatrixElement]];
export type UnitVector = [mathjs.Complex, mathjs.Complex];
type EigenValues = { eigenValue1: mathjs.Complex, eigenValue2: mathjs.Complex };
type EigenVectors = { eigenVector1: UnitVector, eigenVector2: UnitVector };

function equal(vector1: UnitVector, vector2: UnitVector) {
    const comparison: [boolean, boolean] = mathjs.equal(vector1, vector2);
    return comparison[0] && comparison[1];
}

// Solves quadratic equation of the type a*x^2 + b*x + c = 0
function solveQuadratic(a: mathjs.Complex, b: mathjs.Complex, c: mathjs.Complex): [mathjs.Complex, mathjs.Complex] {

    function getSolution(d:mathjs.Complex, coefficient: 1 | -1): mathjs.Complex {
        const dWithFactor = mathjs.multiply(d, coefficient);
        return mathjs.complex(mathjs.divide(mathjs.add(mathjs.multiply(-1, b), dWithFactor), mathjs.multiply(2, a)) as any);
    }

    const d = mathjs.sqrt(mathjs.subtract(mathjs.multiply(b, b), mathjs.multiply(mathjs.multiply(4, a), c)) as mathjs.Complex);
    return [getSolution(d, 1), getSolution(d, -1)];
}

function isBasisVectorEigen(matrix: Matrix2x2): boolean {
    const result = mathjs.multiply(matrix, [1, 0]);
    return !!mathjs.equal(result[1] as mathjs.MathType, 0);
}

export function calculateEigenVectors(matrix: Matrix2x2): EigenVectors {

    const m00 = matrix[0][0] as mathjs.Complex;
    const m01 = matrix[0][1] as mathjs.Complex;
    const m10 = matrix[1][0] as mathjs.Complex;
    const m11 = matrix[1][1] as mathjs.Complex;

    if (isBasisVectorEigen(matrix)) {
        return {
            eigenVector1: [mathjs.complex(1, 0), mathjs.complex(0, 0)],
            eigenVector2: [mathjs.complex(0, 0), mathjs.complex(1, 0)]
        };
    }

    const a = m01;
    const b = mathjs.complex(mathjs.subtract(m00, m11) as any);
    const c = mathjs.complex(mathjs.multiply(-1, m10) as any);

    const [ratio1, ratio2] = solveQuadratic(a, b, c);

    function calculateEigenVector(ratio: mathjs.Complex): [mathjs.Complex, mathjs.Complex] {
        const polar: mathjs.PolarCoordinates = ratio.toPolar();
        const phase: mathjs.Complex = mathjs.exp(mathjs.complex(0, polar.phi));
        const theta = mathjs.atan(polar.r);
        const x = mathjs.complex(mathjs.cos(theta), 0);
        const y = mathjs.multiply(mathjs.sin(theta), phase) as mathjs.Complex;
        return [x, y];
    };

    return {
        eigenVector1: calculateEigenVector(ratio1),
        eigenVector2: calculateEigenVector(ratio2)
    };
};

function calculateEigenValues(matrix: Matrix2x2): EigenValues {

    // calculating eigenvalues of the matrix
    const [eigenValue1, eigenValue2] = solveQuadratic(
        mathjs.complex(1, 0),
        mathjs.multiply(-1, mathjs.add(matrix[0][0], matrix[1][1])) as mathjs.Complex,
        mathjs.subtract(
            mathjs.multiply(matrix[0][0], matrix[1][1]) as mathjs.Complex,
            mathjs.multiply(matrix[0][1], matrix[1][0]) as mathjs.Complex
        ) as mathjs.Complex
    );

    return { eigenValue1, eigenValue2};
}

export function calculateEigen(matrix: Matrix2x2): EigenValues & EigenVectors {

    const {eigenVector1, eigenVector2} = calculateEigenVectors(matrix);
    const {eigenValue1, eigenValue2} = calculateEigenValues(matrix);

    if (equal(
        mathjs.multiply(mathjs.multiply(matrix, eigenVector1), mathjs.conj(eigenValue1)),
        eigenVector1
    )) {
        return {
            eigenVector1: eigenVector1,
            eigenVector2: eigenVector2,
            eigenValue1: eigenValue1,
            eigenValue2: eigenValue2
        };
    }

    return {
        eigenVector1: eigenVector2,
        eigenVector2: eigenVector1,
        eigenValue1: eigenValue1,
        eigenValue2: eigenValue2
    };
}

export function calculateOriantation(matrix: Matrix2x2): { x: number, y: number, z: number, rotationAngle: number } {

    const {eigenVector1, eigenVector2, eigenValue1, eigenValue2} = calculateEigen(matrix);

    const a: mathjs.Complex = eigenVector1[0];
    const b: mathjs.Complex = eigenVector1[1];
    const c: mathjs.Complex = eigenVector2[0];
    const d: mathjs.Complex = eigenVector2[1];
    const offDiagonal = mathjs.subtract(mathjs.multiply(c, mathjs.conj(d)), mathjs.multiply(a, mathjs.conj(b))) as mathjs.Complex;
    const x = offDiagonal.re;
    const y = -1 * offDiagonal.im;
    const z = (mathjs.norm(c) as number)**2 - (mathjs.norm(a) as number)**2;

    const rotationAngle = eigenValue1.toPolar().phi - eigenValue2.toPolar().phi;
    return { x, y, z, rotationAngle };
}

export const IDENTITY: Matrix2x2 = [
    [1, 0],
    [0, 1]
];

export const PAULI_X: Matrix2x2 = [
    [0, 1],
    [1, 0]
];

// @ts-ignore
export const PAULI_Y: Matrix2x2 = [
    [mathjs.complex(0, 0), mathjs.complex(0, -1)],
    [mathjs.complex(0, 1), mathjs.complex(0, 0)]
];

export const PAULI_Z: Matrix2x2 = [
    [1, 0],
    [0, -1]
];