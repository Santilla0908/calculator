const buttonEls = [ ...document.querySelectorAll('.button') ];
const displayEl = document.querySelector('.display');
const openedParenthesisCounterEl = document.querySelector('.opened_parenthesis_counter');

const defaultInputValue = '0';
const operators = [ '+', '-', '*', '/', '%' ];
const maxNumberLength = 20;

const isOperator = char => operators.includes(char);

const hasUnclosedOpeningParenthesis = inputValue => {
	const open = inputValue.split('(').length - 1;
	const close = inputValue.split(')').length - 1;
	return Math.max(0, open - close);
}

const updateParenthesisCounter = () => {
	const count = hasUnclosedOpeningParenthesis(displayEl.value);
	if (count === 0) {
		openedParenthesisCounterEl.classList.add('hidden');
	} else {
		openedParenthesisCounterEl.classList.remove('hidden');
	}
	openedParenthesisCounterEl.innerText = count;
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

const calculate = () => {

}

const inputHandler = e => {
	const value = displayEl.value;

	const isExceptionShown = Object.values(exceptions).includes(value);
	if (isExceptionShown) clear();

	const userInput = getInputValue(e);
	if (userInput === null) return;

	if (userInput === 'clear') return clear();

	if (userInput === 'backspace' && value.length <= 1) return clear();

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

	if (value === defaultInputValue) {
		if (userInput === ')') return;
		if (userInput === '-') return displayEl.value = '-';
		if (isOperator(userInput)) return;
	}

	if (userInput === ')') {
		if (isOperator(value.slice(-1))) return;
		if (!hasUnclosedOpeningParenthesis(value)) return;
	}

	displayEl.value = (() => {
		if (userInput === 'backspace') return value.slice(0, -1);
		if (userInput === '=') return calculate();
		if (userInput === ')') return displayEl.value + ')';
		return value;
	})();
	updateParenthesisCounter();

	if (typeof userInput === 'number') {
		if (displayEl.value === defaultInputValue) {
			displayEl.value = userInput;
			return;
		}
		displayEl.value += userInput;
		return;
	}

	if (userInput === '.') {
		if (displayEl.value === defaultInputValue) {
			displayEl.value = '0.';
			return;
		}
		displayEl.value += '.';
		return;
	}

	if (isOperator(userInput)) {
		const lastChar = value.slice(-1);
		if (isOperator(lastChar)) {
			displayEl.value = displayEl.value.slice(0, -1) + userInput;
			return;
		}
		displayEl.value += userInput;
		return;
	}

	if (userInput === '(') {
		const lastChar = value.slice(-1);
		const isOperatorChar = isOperator(lastChar);
		const isDigit = (char) => /\d/.test(char);
		if (displayEl.value === defaultInputValue) {
			displayEl.value = '(';
			updateParenthesisCounter();
			return;
		}
		if (isOperatorChar || lastChar === '(') {
			displayEl.value += '(';
			updateParenthesisCounter();
			return;
		}
		if (isDigit(lastChar) || lastChar === ')') {
			displayEl.value += '*(';
			updateParenthesisCounter();
		}
	}
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