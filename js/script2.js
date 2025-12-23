const buttonEls = [ ...document.querySelectorAll('.button') ];
const displayEl = document.querySelector('.display');
const openedParenthesisCounterEl = document.querySelector('.opened_parenthesis_counter');

const defaultInputValue = '0';
const operators = [ '+', '-', '*', '/', '%' ];
const maxNumberLength = 15;

const isOperator = char => operators.includes(char);

const isNumber = token => !isNaN(token) && token !== '';

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

	for (const char of input) {
		if ((char >= '0' && char <= '9') || char === '.') {
			numberBuffer += char;
			continue;
		}
		if (numberBuffer) {
			tokens.push(numberBuffer);
			numberBuffer = '';
		}
		tokens.push(char);
	}

	if (numberBuffer) {
		tokens.push(numberBuffer);
	}

	return tokens;
}

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

const calculate = () => {
	const inputValue = displayEl.value;

	if (isOperator(inputValue.slice(-1))) return inputValue;

	let normalizedInput = inputValue;
	const unclosed = getUnclosedParenthesisCount(inputValue);

	if (unclosed > 0) {
		normalizedInput += ')'.repeat(unclosed);
	}

	const tokens = tokenize(normalizedInput);
}

const inputHandler = e => {
	const inputValue = displayEl.value;

	const isExceptionShown = Object.values(exceptions).includes(inputValue);
	if (isExceptionShown) clear();

	const userInput = getInputValue(e);
	if (userInput === null) return;

	if (userInput === 'clear') return clear();

	if (userInput === 'backspace' && inputValue.length <= 1) return clear();

	const lastInputNumber = (() => {
		const parts = displayEl.value.split(/[+\-*/%()]/);
		return parts[parts.length - 1];
	})();

	if (lastInputNumber.length >= maxNumberLength) {
		if (typeof userInput === 'number') return;
		if (userInput === '.') return;
		if (userInput === '(') return;
		if (isOperator(userInput)) return;
	}

	if (userInput === '.' && lastInputNumber.includes('.')) return;

	if (inputValue === defaultInputValue) {
		if (userInput === ')') return;
		if (userInput === '-') return displayEl.value = '-';
		if (isOperator(userInput)) return;
		if (typeof userInput === 'number') return displayEl.value = userInput;
		if (userInput === '.') return displayEl.value = '0.';
		if (userInput === '(') return displayEl.value = '(';
	}
	updateParenthesisCounter();

	if (userInput === ')') {
		if (isOperator(inputValue.slice(-1))) return;
		if (!getUnclosedParenthesisCount(inputValue)) return;
	}

	displayEl.value = (() => {
		if (userInput === 'backspace') return inputValue.slice(0, -1);
		if (userInput === '=') return calculate();
		if (userInput === ')') return displayEl.value + ')';
		if (typeof userInput === 'number') return displayEl.value + userInput;
		if (userInput === '.') return displayEl.value += '.';
		const lastChar = inputValue.slice(-1);
		if (isOperator(userInput)) {
			if (isOperator(lastChar)) return displayEl.value.slice(0, -1) + userInput;
			return displayEl.value + userInput;
		}
		const isDigit = (char) => /\d/.test(char);
		if (userInput === '(') {
			if (isOperator(lastChar) || lastChar === '(') return displayEl.value + '(';
			if (isDigit(lastChar) || lastChar === ')') return displayEl.value + '*(';
		}
		return inputValue;
	})();
	updateParenthesisCounter();
};

buttonEls.forEach(buttonEl => {
	buttonEl.addEventListener('click', e => {
		inputHandler(e);
	});
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