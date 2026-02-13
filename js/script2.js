const buttonEls = [ ...document.querySelectorAll('.button') ];
const buttonsContainerEl = document.querySelector('.buttons');
const displayEl = document.querySelector('.display');
const openedParenthesisCounterEl = document.querySelector('.opened_parenthesis_counter');
const historyDisplayEl = document.querySelector('.history_display');
const logOpenEl = document.querySelector('.log_open');
const logListEl = document.querySelector('.log_list')
const logContainerEl = document.querySelector('.log_items');
const logDeleteEl = document.querySelector('.log_delete');

const defaultInputValue = '0';
const operators = [ '+', '-', '*', '/' ];

const isOperator = char => operators.includes(char);

const isNumber = token => !isNaN(parseFloat(token)) && isFinite(token);

const getUnclosedParenthesisCount = inputValue => {
	const open = inputValue.split('(').length - 1;
	const close = inputValue.split(')').length - 1;
	return open - close;
}

const updateParenthesisCounter = () => {
	const count = getUnclosedParenthesisCount(displayEl.value);
	openedParenthesisCounterEl.innerText = count;
	openedParenthesisCounterEl.classList.toggle('hidden', count === 0);
};

const clear = () => {
	displayEl.value = defaultInputValue;
	historyDisplayEl.innerText = '';
	updateParenthesisCounter();
}

clear();

const exceptions = {
	divisionByZero: 'Деление на ноль',
	numberTooLong: 'Переполнение',
};

const getInputValue = e => {
	const value = (() => {
		if (e.type === 'click') return e.target.dataset.value;
		const key = e.key.toLowerCase();
		switch (key) {
			case ',':
			case 'ю':
			case 'б':
				return '.';
			case 'enter':
				return '=';
			case 'delete':
				return 'clear';
			case 'backspace':
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '+':
			case '-':
			case '*':
			case '/':
			case '.':
			case '=':
			case '(':
			case ')':
			case '%':
				return key;
			default:
				return null;
		}
	})();
	const number = parseInt(value);
	if (isNaN(number)) return value;
	return number;
}

const tokenize = input => {
	const tokens = [];
	let numberBuffer = '';

	const pushNumberIfExists = () => {
		if (!numberBuffer) return;
		tokens.push(numberBuffer);
		numberBuffer = '';
	};

	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		const previousToken = tokens.at(-1);
		const isDigit = char >= '0' && char <= '9';

		if (isDigit || char === '.') {
			numberBuffer += char;
			continue;
		}

		if (char === '-') {
			const isUnaryMinus = i === 0 || (previousToken === '(' && numberBuffer === '');
			if (isUnaryMinus) {
				if (numberBuffer !== '') pushNumberIfExists();
				numberBuffer = '-';
				continue;
			}
		}
		pushNumberIfExists();

		if (char === '%') {
			const lastNumber = tokens.pop();
			if (!isNumber(lastNumber)) return null;
			const percentValue = new Big(lastNumber).div(100).toString();
			tokens.push(percentValue);
			continue;
		}
		tokens.push(char);
	}
	pushNumberIfExists();
	return tokens;
};

const convertToReversePolishNotation = tokens => {
	const output = [];
	const operatorStack = [];
	const precedence = {
		'+': 1,
		'-': 1,
		'*': 2,
		'/': 2
	};

	for (const token of tokens) {
		if (isNumber(token)) {
			output.push(token);
			continue;
		}
		if (isOperator(token)) {
			while (operatorStack.length && isOperator(operatorStack.at(-1)) && precedence[operatorStack.at(-1)] >= precedence[token]) {
				output.push(operatorStack.pop());
			}
			operatorStack.push(token);
			continue;
		}
		if (token === '(') {
			operatorStack.push(token);
			continue;
		}
		if (token === ')') {
			while (operatorStack.length && operatorStack.at(-1) !== '(') {
				output.push(operatorStack.pop());
			}
			operatorStack.pop();
		}
	}
	while (operatorStack.length) {
		output.push(operatorStack.pop());
	}

	return output;
}

const calculateWithPriority = tokens => {
	const stack = [];

	for (const token of tokens) {
		if (isNumber(token)) {
			stack.push(new Big(token));
			continue;
		}
		if (isOperator(token)) {
			const secondOperand = stack.pop();
			const firstOperand = stack.pop();

			if (!secondOperand || !firstOperand) return null;

			let result;

			switch (token) {
				case '+':
					result = firstOperand.plus(secondOperand);
					break;
				case '-':
					result = firstOperand.minus(secondOperand);
					break;
				case '*':
					result = firstOperand.times(secondOperand);
					break;
				case '/':
					if (secondOperand.eq(0)) return exceptions.divisionByZero;
					result = firstOperand.div(secondOperand);
					break;
				default:
					return null;
			}
			const resultStr = result.toString();
			if (resultStr.includes('e')) return exceptions.numberTooLong;
			stack.push(result);
		}
	}
	if (stack.length !== 1) return null;
	return stack[0].round(10).toString();
};

const formatTextExpression = str => {
	const tokens = tokenize(str);
	if (!tokens?.length) return str;
	return tokens.join(' ');
};

const addLogItem = (expression, result) => {
	const itemEl = document.createElement('div');
	itemEl.classList.add('log_item');

	const expressionEl = document.createElement('p');
	expressionEl.classList.add('log_expression');
	expressionEl.textContent = `${ formatTextExpression(expression) } =`;

	const resultEl = document.createElement('p');
	resultEl.classList.add('log_result');
	resultEl.textContent = result;

	itemEl.append(expressionEl, resultEl);

	itemEl.addEventListener('click', () => {
		displayEl.value = result;
		historyDisplayEl.innerText = `${formatTextExpression(expression)} = ${result}`;
		updateParenthesisCounter();
	});

	logListEl.prepend(itemEl);
}

const calculate = () => {
	const inputValue = displayEl.value;

	if (isOperator(inputValue.slice(-1))) return inputValue;

	let normalizedInput = inputValue;
	const unclosed = getUnclosedParenthesisCount(inputValue);

	if (unclosed > 0) {
		normalizedInput += ')'.repeat(unclosed);
	}

	let tokens = tokenize(normalizedInput);
	if (tokens === null) return null;

	const rpn = convertToReversePolishNotation(tokens);
	const result = calculateWithPriority(rpn);

	if (result === null) return null;
	historyDisplayEl.innerText = `${ formatTextExpression(inputValue) } = ${ result }`;

	if (!Object.values(exceptions).includes(result)) {
		addLogItem(inputValue, result);
	}

	updateParenthesisCounter();
	return result;
};

const inputHandler = e => {
	const originalInputValue = displayEl.value;

	const isExceptionShown = Object.values(exceptions).includes(originalInputValue);
	if (isExceptionShown) clear();
	const inputValue = displayEl.value;

	const userInput = getInputValue(e);
	if (userInput === null) return;

	if (userInput === 'clear') return clear();

	if (userInput === 'backspace' && inputValue.length <= 1) return clear();

	const lastNumericToken = (() => {
		const parts = displayEl.value.split(/[+\-*/%()]/);
		return parts[parts.length - 1] || null;
	})();
	if (userInput === '.' && lastNumericToken?.includes('.')) return;

	if (userInput === '%' && !isNumber(inputValue.slice(-1))) return;

	const isUnaryMinus = inputValue === defaultInputValue || inputValue === '-';

	if (inputValue === defaultInputValue) {
		switch (userInput) {
			case ')':
			case '%':
				return;
			case '-':
			case '(':
				return displayEl.value = userInput;
			case '.':
				return displayEl.value = '0.';
			default: {
				if (isOperator(userInput)) return;
				if (typeof userInput === 'number') return displayEl.value = userInput;
			}
		}
	}

	if (userInput === ')') {
		if (isOperator(inputValue.slice(-1))) return;
		if (!getUnclosedParenthesisCount(inputValue)) return;
	}

	displayEl.value = (() => {
		switch (userInput) {
			case ')':
			case '.':
			case '%':
				return inputValue + userInput;
			case 'backspace':
				return inputValue.slice(0, -1);
			case '=':
				return calculate();
			default: {
				if (typeof userInput === 'number') return inputValue + userInput;
				const lastChar = inputValue.slice(-1);
				if (isOperator(userInput)) {
					if (isOperator(lastChar)) {
						if (isUnaryMinus) return inputValue;
						return inputValue.slice(0, -1) + userInput;
					}
					return inputValue + userInput;
				}
				if (userInput === '(') {
					if (isOperator(lastChar) || lastChar === '(') return displayEl.value + '(';
					if (isNumber(lastChar) || lastChar === ')') return displayEl.value + '*(';
				}
				return inputValue;
			}
		}
	})();

	updateParenthesisCounter();
};

logOpenEl.addEventListener('click', () => {
	const isShow = logContainerEl.classList.toggle('show');
	const calculator = document.querySelector('.calculator');

	calculator.classList.toggle('opened', isShow);
});

buttonEls.forEach(buttonEl => {
	buttonEl.addEventListener('click', e => {
		inputHandler(e);
	});
});

logDeleteEl.addEventListener('click', () => {
	logContainerEl.querySelectorAll('.log_item').forEach(el => el.remove());
});

window.addEventListener('keydown', e => {
	switch (e.key) {
		case 'F5':
		case 'F12':
			return;
		default:
			e.preventDefault();
			inputHandler(e);
	}
});