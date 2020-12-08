// @ts-nocheck

import * as  mathjs from 'mathjs';

export function calculateEigenVectors() {

    // const matrix = [[1, 0], [0, 1]];
    // const matrix = [[1, 0], [0, -1]];
    // const matrix = [[0, 1], [1, 0]];
    // const matrix = [[0, mathjs.complex(0, -1)], [mathjs.complex(0, 1), 0]];
    // const matrix = [[mathjs.complex(1, 6), 15], [7, mathjs.complex(-2, -5)]];
    const matrix: any = mathjs.multiply(mathjs.sqrt(1/2), [[1, 1], [1, -1]]);
    // console.log('matrix', matrix);
    const m00 = matrix[0][0] as mathjs.Complex;
    const m01 = matrix[0][1] as mathjs.Complex;
    const m10 = matrix[1][0] as mathjs.Complex;
    const m11 = matrix[1][1] as mathjs.Complex;

    const a = m01;
    const b = mathjs.subtract(m00, m11);
    const c = mathjs.multiply(-1, m10);
    const d = mathjs.sqrt(mathjs.subtract(mathjs.multiply(b, b), mathjs.multiply(mathjs.multiply(4, a), c)) as mathjs.Complex);

    console.log('a', a, 'b', b, 'c', c, 'd', d);

    const calculateRatio = (coefficient: 1 | -1) => {
        const dWithFactor = mathjs.multiply(d, coefficient);
        return mathjs.divide(mathjs.add(mathjs.multiply(-1, b), dWithFactor), mathjs.multiply(2, a));
    }

    const ratio1: mathjs.Complex = mathjs.complex(calculateRatio(1) as any);
    const ratio2: mathjs.Complex = mathjs.complex(calculateRatio(-1) as any);

    const calculateEigenVector = (ratio: mathjs.Complex) => {
        const polar: mathjs.PolarCoordinates = ratio.toPolar();
        const phase = mathjs.exp(mathjs.complex(0, polar.phi));
        const theta = mathjs.atan(polar.r); // TODO: should atan2 be used here?
        const x = mathjs.cos(theta);
        const y = mathjs.multiply(mathjs.sin(theta), phase);
        return [x, y];
    };

    {
        const ratios = {ratio1, ratio2};
        for (let key in ratios) {
            const ratio = ratios[key] as mathjs.Complex;
            const [x, y] = calculateEigenVector(ratio);
            console.log('ratio:', ratio);

            const product = mathjs.multiply(mathjs.matrix(matrix as any), [x as any, y as any]);

            console.log('product:', product);
            console.log('x:', x);
            console.log('y:', y);

            console.log('x ratio:', mathjs.divide(product.get([0]), x));
            console.log('y ratio:', mathjs.divide(product.get([1]), y));
        }
    }

};