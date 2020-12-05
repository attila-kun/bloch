import * as  mathjs from 'mathjs';

export function calculateEigenVectors() {

    const matrix = [[mathjs.complex(1, 0), 1], [1, -1]];
    const m00 = matrix[0][0];
    const m01 = matrix[0][1];
    const m10 = matrix[1][0];
    const m11 = matrix[1][1];

    const a = m01;
    const b = mathjs.subtract(m00, m11);
    const c = -m10;
    const d = mathjs.sqrt(mathjs.subtract(mathjs.multiply(b, b), mathjs.multiply(mathjs.multiply(4, a), c)) as mathjs.Complex);

    const calculateRatio = (coefficient: 1 | -1) => {
        const dWithFactor = mathjs.multiply(d, coefficient);
        return mathjs.divide(mathjs.add(mathjs.multiply(-1, b), dWithFactor), mathjs.multiply(2, a));
    }

    const ratio1 = calculateRatio(1);
    const ratio2 = calculateRatio(-1);

    console.log(ratio1, ratio2);
};