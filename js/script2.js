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
		if (displayEl.value === '0') {
			displayEl.value = String(inputValue);
		} else {
			displayEl.value += inputValue
		}
		return;
	}

	if (inputValue === '.') {
		if (displayEl.value.includes('.')) return;
		displayEl.value += '.';
		return;
	}

	if (inputValue === 'backspace') return;

	if (inputValue === '=') {
		calculate();
		return;
	}

	if (['+', '-', '*', '/', '%'].includes(inputValue)) return;

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