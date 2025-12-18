const buttonEls = [ ...document.querySelectorAll('.button') ];
const displayEl = document.querySelector('.display');
const openedParenthesisCounterEl = document.querySelector('.opened_parenthesis_counter');

const defaultInputValue = '0';
const operators = [ '+', '-', '*', '/', '%' ];

const isOperator = char => operators.includes(char);

const hasUnclosedOpeningParenthesis = inputValue => {
	const open = inputValue.split('(').length - 1;
	const close = inputValue.split(')').length - 1;
	return open > close;
}

const clear = () => {
	displayEl.value = defaultInputValue;
	openedParenthesisCounterEl.innerText = '0';
	openedParenthesisCounterEl.classList.add('hidden');
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

	const inputValue = getInputValue(e);
	if (inputValue === null) return;

	if (inputValue === 'clear') return clear();

	if (inputValue === 'backspace' && value.length <= 1) return clear();

	const lastInputNumber = (() => {
		const parts = displayEl.value.split(/[+\-*/%()]/);
		return parts[parts.length - 1];
	})();
	if (inputValue === '.' && lastInputNumber.includes('.')) return;

	if (value === defaultInputValue) {
		if (inputValue === ')') return;
		if (inputValue === '-') return displayEl.value = '-';
		if (isOperator(inputValue)) return;
	}

	if (inputValue === ')') {
		if (isOperator(value.slice(-1))) return;
		if (!hasUnclosedOpeningParenthesis(value)) return;
	}

	displayEl.value = (() => {
		if (inputValue === 'backspace') return value.slice(0, -1);
		if (inputValue === '=') return calculate();
		if (inputValue === ')') return value + ')';
		return value;
	})();

	if (typeof inputValue === 'number') {
		if (displayEl.value === defaultInputValue) {
			displayEl.value = inputValue;
			return;
		}
		displayEl.value += inputValue;
		return;
	}

	if (inputValue === '.') {
		if (displayEl.value === defaultInputValue) {
			displayEl.value = '0.';
			return;
		}
		displayEl.value += '.';
		return;
	}

	if (isOperator(inputValue)) {
		const lastChar = value.slice(-1);
		if (isOperator(lastChar)) {
			displayEl.value = displayEl.value.slice(0, -1) + inputValue;
			return;
		}
		displayEl.value += inputValue;
		return;
	}

	if (inputValue === '(') {
		const lastChar = value.slice(-1);
		const isOperatorChar = isOperator(lastChar);
		const isDigit = (char) => /\d/.test(char);
		if (displayEl.value === defaultInputValue) {
			displayEl.value = '(';
			return;
		}
		if (isOperatorChar || lastChar === '(') {
			displayEl.value += '(';
			return;
		}
		if (isDigit(lastChar) || lastChar === ')') {
			displayEl.value += '*(';
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