const buttonEls = [ ...document.querySelectorAll('.button') ];
const displayEl = document.querySelector('.display');

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

const calculate = () => {

}

const inputHandler = e => {
	const inputValue = getInputValue(e);
	if (inputValue === null) return;

	if (inputValue === 'clear') {
		clear();
		return;
	}

	if (typeof inputValue === 'number') {
		if (Object.values(exceptions).includes(displayEl.value)) {
			displayEl.value = String(inputValue);
			return;
		}
		if (displayEl.value === '0') {
			displayEl.value = String(inputValue);
			return;
		}
		displayEl.value += inputValue
		return;
	}

	if (inputValue === '.') {
		if (Object.values(exceptions).includes(displayEl.value)) {
			displayEl.value = '0.';
			return;
		}
		if (displayEl.value.includes('.')) return;
		displayEl.value += '.';
		return;
	}

	if (inputValue === '-') {
		if (Object.values(exceptions).includes(displayEl.value)) {
			displayEl.value = '-';
			return;
		}
		if (displayEl.value === '0') {
			displayEl.value = '-';
			return;
		}
	}

	if (inputValue === 'backspace') {
		if (Object.values(exceptions).includes(displayEl.value)) {
			displayEl.value = '0';
			return;
		}
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
		if (Object.values(exceptions).includes(displayEl.value)) return;
		const lastChar = displayEl.value.slice(-1);

		if (['+', '-', '*', '/', '%'].includes(lastChar)) {
			displayEl.value = displayEl.value.slice(0, -1) + inputValue;
			return;
		}

		if (displayEl.value === '0') return;

		displayEl.value += inputValue;
		return;
	}

	if (inputValue === '(' || inputValue === ')') return;
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