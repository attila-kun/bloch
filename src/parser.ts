// @ts-nocheck

import {add, complex, divide, multiply, pow, subtract} from 'mathjs';

var CALC_CONST = {
  // define your constants
  e: Math.E,
  pi: Math.PI,
  i: complex(0, 1)
};

var CALC_NUMARGS: [RegExp, number][] = [
  [/^(\^\+|\^-|\^|\*|\/|\+|\-)$/, 2],
  [/^(floor|ceil|(sin|cos|tan|sec|csc|cot)h?)$/, 1]
];

// Adapted from https://stackoverflow.com/questions/18477968/convert-latex-to-dynamic-javascript-function
let Calc: any = function(expr, infix) {
  this.valid = true;
  this.expr = expr;

  if (!infix) {
    // by default treat expr as raw latex
    this.expr = this.latexToInfix(expr);
  }

  var OpPrecedence = function(op) {
    if (typeof op == "undefined") return 0;

    return op.match(/^(floor|ceil|(sin|cos|tan|sec|csc|cot)h?)$/) ? 10

         : (op === "^" || op === "^-" || op === "^+") ? 9
         : (op === "*" || op === "/") ? 8
         : (op === "+" || op === "-") ? 7

         : 0;
  }

  var OpAssociativity = function(op) {
    return op.match(/^(floor|ceil|(sin|cos|tan|sec|csc|cot)h?)$/) ? "R" : "L";
  }

  var numArgs = function(op) {
    for (var i = 0; i < CALC_NUMARGS.length; i++) {
      if (CALC_NUMARGS[i][0].test(op)) return CALC_NUMARGS[i][1];
    }
    return false;
  }

  this.rpn_expr = [];
  var rpn_expr = this.rpn_expr;

  this.expr = this.expr.replace(/\s+/g, "");

  // This nice long regex matches any valid token in a user
  // supplied expression (e.g. an operator, a constant or
  // a variable)
  var in_tokens = this.expr.match(/(\^\+|\^-|\^|\*|\/|\+|\-|\(|\)|[a-zA-Z0-9\.]+)/gi);
  var op_stack = [];

  in_tokens.forEach(function(token) {
    if (/^[a-zA-Z]+$/.test(token) && numArgs(token) === false) {
      if (CALC_CONST.hasOwnProperty(token)) {
        // Constant. Pushes a value onto the stack.
        rpn_expr.push(["num", CALC_CONST[token]]);
      }
      else {
        // Variables (i.e. x as in f(x))
        rpn_expr.push(["var", token]);
      }
    }
    else {
      var numVal = parseFloat(token);
      if (!isNaN(numVal)) {
        // Number - push onto the stack
        rpn_expr.push(["num", numVal]);
      }
      else if (token === ")") {
        // Pop tokens off the op_stack onto the rpn_expr until we reach the matching (
        while (op_stack[op_stack.length - 1] !== "(") {
          rpn_expr.push([numArgs(op_stack[op_stack.length - 1]), op_stack.pop()]);
          if (op_stack.length === 0) {
            this.valid = false;
            return;
          }
        }

        // remove the (
        op_stack.pop();
      }
      else if (token === "(") {
        op_stack.push(token);
      }
      else {
        // Operator
        var tokPrec = OpPrecedence(token),
           headPrec = OpPrecedence(op_stack[op_stack.length - 1]);

        while ((OpAssociativity(token) === "L" && tokPrec <= headPrec) ||
          (OpAssociativity(token) === "R" && tokPrec < headPrec)) {

          rpn_expr.push([numArgs(op_stack[op_stack.length - 1]), op_stack.pop()]);
          if (op_stack.length === 0) break;

          headPrec = OpPrecedence(op_stack[op_stack.length - 1]);
        }

        op_stack.push(token);
      }
    }
  });

  // Push all remaining operators onto the final expression
  while (op_stack.length > 0) {
    var popped = op_stack.pop();
    if (popped === ")") {
      this.valid = false;
      break;
    }
    rpn_expr.push([numArgs(popped), popped]);
  }
}

/**
 * returns the result of evaluating the current expression
 */
Calc.prototype.eval = function(x) {
  var stack = [], rpn_expr = this.rpn_expr;

  rpn_expr.forEach(function(token) {
    if (typeof token[0] == "string") {
      switch (token[0]) {
        case "var":
          // Variable, i.e. x as in f(x); push value onto stack
          //if (token[1] != "x") return false;
          stack.push(x);
          break;

        case "num":
          // Number; push value onto stack
          stack.push(token[1]);
          break;
      }
    }
    else {
      // Operator
      var numArgs = token[0];
      var args = [];
      do {
        args.unshift(stack.pop());
      } while (args.length < numArgs);

      switch (token[1]) {
        /* BASIC ARITHMETIC OPERATORS */
        case "*":
          stack.push(multiply(args[0], args[1]));
          break;
        case "/":
          stack.push(divide(args[0], args[1]));
          break;
        case "+":
          stack.push(add(args[0], args[1]));
          break;
        case "-":
          stack.push(subtract(args[0], args[1]));
          break;

        // exponents
        case "^-":
          stack.push(pow(args[0], multiply(-1, args[1])));
          break;
        case "^":
        case "^+":
          stack.push(pow(args[0], args[1]));
          break;

        /* TRIG FUNCTIONS */
        case "sin":
          stack.push(Math.sin(args[0]));
          break;
        case "cos":
          stack.push(Math.cos(args[0]));
          break;
        case "tan":
          stack.push(Math.tan(args[0]));
          break;
        case "sec":
          stack.push(1 / Math.cos(args[0]));
          break;
        case "csc":
          stack.push(1 / Math.sin(args[0]));
          break;
        case "cot":
          stack.push(1 / Math.tan(args[0]));
          break;
        case "sinh":
          stack.push(.5 * (Math.pow(Math.E, args[0]) - Math.pow(Math.E, -args[0])));
          break;
        case "cosh":
          stack.push(.5 * (Math.pow(Math.E, args[0]) + Math.pow(Math.E, -args[0])));
          break;
        case "tanh":
          stack.push((Math.pow(Math.E, 2*args[0]) - 1) / (Math.pow(Math.E, 2*args[0]) + 1));
          break;
        case "sech":
          stack.push(2 / (Math.pow(Math.E, args[0]) + Math.pow(Math.E, -args[0])));
          break;
        case "csch":
          stack.push(2 / (Math.pow(Math.E, args[0]) - Math.pow(Math.E, -args[0])));
          break;
        case "coth":
          stack.push((Math.pow(Math.E, 2*args[0]) + 1) / (Math.pow(Math.E, 2*args[0]) - 1));
          break;


        case "floor":
          stack.push(Math.floor(args[0]));
          break;
        case "ceil":
          stack.push(Math.ceil(args[0]));
          break;

        default:
          // unknown operator; error out
          return false;
      }
    }
  });

  return stack.pop();
};

Calc.prototype.latexToInfix = function(latex) {
  /**
    * function: converts latex notation to infix notation (human-readable, to be converted
    * again to prefix in order to be processed
    *
    * Supported functions / operators / notation:
    * parentheses, exponents, adding, subtracting, multipling, dividing, fractions
    * trigonometric (including hyperbolic) functions, floor, ceil
    */

  var infix = latex;

  infix = infix
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, "($1)/($2)") // fractions
    .replace(/(\\left\(|{)/g, "(") // open parenthesis
    .replace(/(\\right\)|})/g, ")") // close parenthesis
    .replace(/[^\(](floor|ceil|(sin|cos|tan|sec|csc|cot)h?)\(([^\(\)]+)\)[^\)]/g, "($&)") // functions
    .replace(/([^(floor|ceil|(sin|cos|tan|sec|csc|cot)h?|\+|\-|\*|\/|\^)])\(/g, "$1*(")
    .replace(/\)([\w])/g, ")*$1")
    .replace(/([0-9])([A-Za-z])/g, "$1*$2")
    .replace(/(i)([0-9])/g, "$1*$2")
    .replace(/(^|[^a-zA-Z0-9\^])([\+-])([a-zA-Z0-9(])/g, "$10$2$3") // standalone - or + signs are prefixed with 0 so the operator will always have 2 arguments
  ;

  return infix;
};

export default Calc;