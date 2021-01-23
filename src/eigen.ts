import { add, atan, complex, Complex, conj, cos, divide, equal, exp, MathArray, multiply, norm, PolarCoordinates, sin, sqrt, subtract } from "mathjs";

type MatrixElement = number | Complex;
export type Matrix2x2 = MathArray & [[MatrixElement, MatrixElement], [MatrixElement, MatrixElement]];
export type UnitVector = [Complex, Complex];
type EigenValues = { eigenValue1: Complex, eigenValue2: Complex };
type EigenVectors = { eigenVector1: UnitVector, eigenVector2: UnitVector };


function vectorsEqual(vector1: UnitVector, vector2: UnitVector) {
    // @ts-ignore
    const comparison: [boolean, boolean] = equal(vector1, vector2);
    return comparison[0] && comparison[1];
}

// Solves quadratic equation of the type a*x^2 + b*x + c = 0
function solveQuadratic(a: Complex, b: Complex, c: Complex): [Complex, Complex] {

    function getSolution(d: Complex, coefficient: 1 | -1): Complex {
        const dWithFactor = multiply(d, coefficient);
        return complex(divide(add(multiply(-1, b), dWithFactor), multiply(2, a)) as any);
    }

    const d = sqrt(subtract(multiply(b, b), multiply(multiply(4, a), c)) as Complex);
    return [getSolution(d, 1), getSolution(d, -1)];
}

function isBasisVectorEigen(matrix: Matrix2x2): boolean {
    const result: any = multiply(matrix, [1, 0]);
    return !!equal(result[1], 0);
}

export function calculateEigenVectors(matrix: Matrix2x2): EigenVectors {

    const m00 = matrix[0][0] as Complex;
    const m01 = matrix[0][1] as Complex;
    const m10 = matrix[1][0] as Complex;
    const m11 = matrix[1][1] as Complex;

    if (isBasisVectorEigen(matrix)) {
        return {
            eigenVector1: [complex(1, 0), complex(0, 0)],
            eigenVector2: [complex(0, 0), complex(1, 0)]
        };
    }

    const a = m01;
    const b = complex(subtract(m00, m11) as any);
    const c = complex(multiply(-1, m10) as any);

    const [ratio1, ratio2] = solveQuadratic(a, b, c);

    function calculateEigenVector(ratio: Complex): [Complex, Complex] {
        const polar: PolarCoordinates = ratio.toPolar();
        const phase: Complex = exp(complex(0, polar.phi));
        const theta = atan(polar.r);
        const x = complex(cos(theta), 0);
        const y = multiply(sin(theta), phase) as Complex;
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
        complex(1, 0),
        multiply(-1, add(matrix[0][0], matrix[1][1])) as Complex,
        subtract(
            multiply(matrix[0][0], matrix[1][1]) as Complex,
            multiply(matrix[0][1], matrix[1][0]) as Complex
        ) as Complex
    );

    return { eigenValue1, eigenValue2};
}

export function calculateEigen(matrix: Matrix2x2): EigenValues & EigenVectors {

    const {eigenVector1, eigenVector2} = calculateEigenVectors(matrix);
    const {eigenValue1, eigenValue2} = calculateEigenValues(matrix);

    if (vectorsEqual(
        // @ts-ignore
        multiply(multiply(matrix, eigenVector1), conj(eigenValue1)),
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

    const a: Complex = eigenVector1[0];
    const b: Complex = eigenVector1[1];
    const c: Complex = eigenVector2[0];
    const d: Complex = eigenVector2[1];
    const offDiagonal = subtract(multiply(c, conj(d)), multiply(a, conj(b))) as Complex;
    const x = offDiagonal.re;
    const y = -1 * offDiagonal.im;
    const z = (norm(c) as number)**2 - (norm(a) as number)**2;

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
    [complex(0, 0), complex(0, -1)],
    [complex(0, 1), complex(0, 0)]
];

export const PAULI_Z: Matrix2x2 = [
    [1, 0],
    [0, -1]
];