const buttonEls = [ ...document.querySelectorAll('.button') ];
const displayEl = document.querySelector('.display');
displayEl.value = '0'

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

const clear = () => {
	displayEl.value = '0';
}

const isOperatorChar = (char) => {
	return ['+', '-', '*', '/', '%'].includes(char);
}

const getCurrentNumber = (displayValue) => {
	const parts = displayValue.split(/[+\-*/%()]/);
	return parts[parts.length - 1];
}

const hasUnclosedOpeningParen = (value) => {
	const open = value.split('(').length - 1;
	const close = value.split(')').length - 1;
	return open > close;
}

const calculate = () => {

}

const inputHandler = e => {
	const inputValue = getInputValue(e);
	if (inputValue === null) return;

	if (inputValue === 'clear') {
		clear();
		return;
	}

	const isExceptionShown = Object.values(exceptions).includes(displayEl.value);

	if (isExceptionShown) {
		displayEl.value = '0';
	}

	if (typeof inputValue === 'number') {
		if (displayEl.value === '0') {
			displayEl.value = String(inputValue);
			return;
		}
		displayEl.value += inputValue
		return;
	}

	if (inputValue === '.') {
		const currentNumber = getCurrentNumber(displayEl.value);

		if (currentNumber.includes('.')) return;
		if (displayEl.value === '0') {
			displayEl.value = '0.';
			return;
		}
		displayEl.value += '.';
		return;
	}

	if (inputValue === '-') {
		if (displayEl.value === '0') {
			displayEl.value = '-';
			return;
		}
	}

	if (inputValue === 'backspace') {
		if (displayEl.value.length === 1) {
			displayEl.value = '0';
			return;
		}
		displayEl.value = displayEl.value.slice(0, -1);
		return;
	}

	if (inputValue === '=') {
		calculate();
		return;
	}

	if (['+', '-', '*', '/', '%'].includes(inputValue)) {

		const lastChar = displayEl.value.slice(-1);
		const isOperator = isOperatorChar(lastChar);

		if (isOperator) {
			displayEl.value = displayEl.value.slice(0, -1) + inputValue;
			return;
		}

		if (displayEl.value === '0') return;

		displayEl.value += inputValue;
		return;
	}

	if (inputValue === '(' || inputValue === ')') {
		const lastChar = displayEl.value.slice(-1);
		const isOperator = isOperatorChar(lastChar);
		const isDigit = (char) => /\d/.test(char);

		if (inputValue === '(') {
			if (displayEl.value === '0') {
				displayEl.value = '(';
				return;
			}
			if (isOperator || lastChar === '(') {
				displayEl.value += '(';
				return;
			}
			if (isDigit(lastChar) || lastChar === ')') {
				displayEl.value += '*(';
				return;
			}
			return;
		}

		if (inputValue === ')') {
			if (displayEl.value === '0') return;
			if (isOperator) return;
			if (!hasUnclosedOpeningParen(displayEl.value)) return;

			displayEl.value += ')';
			return;
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