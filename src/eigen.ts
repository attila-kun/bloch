import * as  mathjs from 'mathjs';

type MatrixElement = number | mathjs.Complex;
export type Matrix2x2 = [[MatrixElement, MatrixElement], [MatrixElement, MatrixElement]];
export type EigenVector = [mathjs.Complex, mathjs.Complex];

export function calculateEigenVectors(matrix: Matrix2x2): { vector1: EigenVector, vector2: EigenVector } {

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