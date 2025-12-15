const historyEl = document.querySelector('.history');
const historyDisplayEl = document.querySelector('.history_display');
const currentInputEl = document.querySelector('.display');
const historyContainer = document.querySelector('.history_container');
const textEl = historyContainer.querySelector('.history_text');
const buttonsContainer = document.querySelector('.buttons');
const deleteHistory = document.querySelector('.delete');

const state = {
	history: JSON.parse(localStorage.getItem('calcHistory') || '[]')
};

const getExpression = () => currentInputEl.value;

const setExpression = (value, caretPos = null) => {
	currentInputEl.value = value;
	if (caretPos === null) {
		const pos = value.length;
		currentInputEl.setSelectionRange(pos, pos);
	} else {
		currentInputEl.setSelectionRange(caretPos, caretPos);
	}
	currentInputEl.focus();
}

const insertAtCursor = (text) => {
	const start = currentInputEl.selectionStart;
	const end = currentInputEl.selectionEnd;
	const before = currentInputEl.value.slice(0, start);
	const after = currentInputEl.value.slice(end);
	const newValue = before + text + after;
	setExpression(newValue, start + text.length);
}

const renderHistory = () => {
	if (state.history.length === 0) {
		textEl.innerText = `История пуста`;
		return;
	}
	textEl.innerText = state.history.join('\n');
}

historyEl.addEventListener('click', () => {
	const isShow = historyContainer.classList.toggle('show');
	if (isShow) {
		buttonsContainer.style.display = 'none';
		renderHistory()
	} else {
		buttonsContainer.style.display = 'grid';
	}
});

deleteHistory.addEventListener('click', () => {
	textEl.innerText = '';
	localStorage.removeItem('calcHistory');
});

const updateHistoryDisplay = (newEntry) => {
	state.history.push(newEntry);

	if (state.history.length > 2) {
		state.history = state.history.slice(-2);
	}

	historyDisplayEl.innerText = state.history.join('\n');
	localStorage.setItem('calcHistory', JSON.stringify(state.history));
}

const safeEvaluateWithPrecedence = (expression) => {
	expression = String(expression).replace(/\s+/g, '').replace(/,/g, '.');
	if (expression.length === 0) throw new Error('Пустое выражение');

	const tokens = [];
	let numberBuffer = '';
	for (let i = 0; i < expression.length; i++) {
		const symbol = expression[i];

		if (/[0-9.]/.test(symbol)) {
			numberBuffer += symbol;
			continue;
		}

		if (numberBuffer) {
			if ((numberBuffer.match(/\./g) || []).length > 1) {
				throw new Error('Неправильный формат числа');
			}
			tokens.push(numberBuffer);
			numberBuffer = '';
		}

		if (symbol === '-' && (tokens.length === 0 || /[+\-*/(]/.test(tokens[tokens.length - 1]))) {
			numberBuffer = '-';
			continue;
		}

		if (symbol === '(' || symbol === ')') {
			tokens.push(symbol);
			continue;
		}

		if (/[+\-*/]/.test(symbol)) {
			tokens.push(symbol);
			continue;
		}

		throw new Error('Недопустимый символ в выражении');
	}

	if (numberBuffer) {
		if ((numberBuffer.match(/\./g) || []).length > 1) {
			throw new Error('Неправильный формат числа');
		}
		tokens.push(numberBuffer);
	}
	if (tokens.length === 0) throw new Error('Пустое выражение');

	const outputQueue = [];
	const opStack = [];
	const precedence = {
		'+': 1,
		'-': 1,
		'*': 2,
		'/': 2
	}

	for (const t of tokens) {
		if (/^-?(?:\d+(\.\d*)?|\.\d+)$/.test(t)) {
			outputQueue.push(t);
		} else if (/[+\-*/]/.test(t)) {
			while (opStack.length && precedence[opStack[opStack.length - 1]] >= precedence[t]) {
				outputQueue.push(opStack.pop());
			}
			opStack.push(t);
		} else if (t === '(') {
			opStack.push(t);
		} else if (t === ')') {
			while (opStack.length && (opStack[opStack.length - 1] !== '(')) {
				outputQueue.push(opStack.pop());
			}
			if (opStack.length === 0 || opStack.pop() !== '(') {
				throw new Error('Скобки не согласованы');
			}
		} else {
			throw new Error('Неизвестный токен');
		}
	}

	while (opStack.length) {
		const p = opStack.pop();
		if (p === '(' || p === ')') throw new Error('Скобки не согласованы')
		outputQueue.push(p);
	}

	const evalStack = [];
	for (const token of outputQueue) {
		if (/^-?(?:\d+(\.\d*)?|\.\d+)$/.test(token)) {
			evalStack.push(new Big(token));
		} else {
			const b = evalStack.pop();
			const a = evalStack.pop();
			if (a === undefined || b === undefined) throw new Error('Ошибка в выражении');
			switch (token) {
				case '+': evalStack.push(a.plus(b)); break;
				case '-': evalStack.push(a.minus(b)); break;
				case '*': evalStack.push(a.times(b)); break;
				case '/':
					if (b.eq(0)) throw new Error('Деление на ноль');
					evalStack.push(a.div(b));
					break;
				default: throw new Error('Недопустимый оператор при вычислении');
			}
		}
	}
	if (evalStack.length !== 1) throw new Error('Ошибка вычисления');
	return evalStack[0].toString();
}

const calculatorResult = () => {
	const inputExpression = getExpression();

	if (!inputExpression.trim()) {
		setExpression('Введите выражение');
		return;
	}

	try {
		let expressionToCalculate = inputExpression;
		let finalOperator = '';

		const lastCharacter = expressionToCalculate.slice(-1);
		if (['+', '-', '*', '/'].includes(lastCharacter)) {
			finalOperator = lastCharacter;
			expressionToCalculate = expressionToCalculate.slice(0, -1);
		}

		const calculatedResult = safeEvaluateWithPrecedence(expressionToCalculate);

		updateHistoryDisplay(`${inputExpression} = ${calculatedResult}`)

		const resultToShow = calculatedResult + finalOperator;
		setExpression(resultToShow);

	} catch (error) {
		console.log(`Ошибка вычисления:`, error);

		if (error.message.includes(`Деление на ноль`)) {
			setExpression(`Деление на ноль невозможно`);
		}  else if (error.message.includes(`не завершено`)) {
			setExpression(`Выражение не завершено`);
		} else {
			setExpression('Ошибка вычисления');
		}
	}
}

buttonsContainer.addEventListener('click', e => {
	const button = e.target;
	if(!button.classList.contains('button')) return;

	const action = button.dataset.action;
	const value = button.dataset.value;
	
	console.log(`Кликнули:`,  action, value);

	if (action === 'digit') {
		insertAtCursor(value);
	}
	else if (action === 'operator') {
		insertAtCursor(value);
	}
	else if (action === 'bracket') {
		insertAtCursor(value);
	}
	else if (action === 'backspace') {
		const start = currentInputEl.selectionStart;
		const end = currentInputEl.selectionEnd;
		const expr = getExpression();

		if (start !== end) {
			const before = expr.slice(0, start);
			const after = expr.slice(end);
			setExpression(before + after, start);
			return;
		}
		if (start === 0) {
			return;
		}
		const before = expr.slice(0, start -1);
		const after = expr.slice(start);
		const newCaretPos = start - 1;
		setExpression(before + after, newCaretPos);
	}
	else if (action === 'clear') {
		setExpression('');
		state.history = [];
		historyDisplayEl.innerText = '';
		localStorage.removeItem('calcHistory');
	}
	else if (action === 'equals') {
		calculatorResult();
	}
});

const allowedChars = /[0-9+\-*/().%]/;

const specialKeys = {
	calculate: ['Enter', '='],
	clear: ['Escape', 'c'],
};

const allowedControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
	'Enter', 'Escape', 'Home', 'End', 'Tab'];

window.addEventListener('keydown', (e) => {
	const active = document.activeElement === currentInputEl;

	if (specialKeys.calculate.includes(e.key)) {
		if (!active) return;
		e.preventDefault();
		calculatorResult();
		return;
	}
	if (specialKeys.clear.includes(e.key.toLowerCase())) {
		if (!active) return;
		e.preventDefault();
		setExpression('');
		return;
	}
	if (allowedControl.includes(e.key)) {
		return;
	}
	if (e.ctrlKey || e.metaKey) return;
	if (!active) return;

	const key = e.key.length === 1 ? e.key : '';
	if (allowedChars.test(key)) {
		if (key === '.') {
			const expression = getExpression();
			const start = currentInputEl.selectionStart;
			const lastNumberMatch = expression.slice(0, start).match(/-?\d+\.?\d*$/);
			if (lastNumberMatch && lastNumberMatch[0].includes('.')) {
				e.preventDefault();
				return;
			}
		}
		return;
	}
	e.preventDefault();
});

currentInputEl.addEventListener('paste', (e) => {
	e.preventDefault();
	const raw = (e.clipboardData || window.clipboardData).getData('text');
	const noSpaces = raw.replace(/\s+/g, '');
	const replacedCommas = noSpaces.replace(/,/g, '.');
	const noExtraDots = replacedCommas.replace(/(\d*\.)\.+/g, '$1');
	const finalText = noExtraDots.split('').filter(ch => allowedChars.test(ch)).join('');
	if (!finalText) return;
	insertAtCursor(finalText);
});

currentInputEl.addEventListener('input', () => {
	const raw = getExpression();
	const noSpaces = raw.replace(/\s+/g, '');
	const replacedCommas = noSpaces.replace(/,/g, '.');
	const noExtraDots = replacedCommas.replace(/(\d*\.)\.+/g, '$1');
	const finalText = noExtraDots.split('').filter(ch => allowedChars.test(ch)).join('');
	if (finalText !== raw) {
		const pos = currentInputEl.selectionStart;
		setExpression(finalText, Math.min(pos, finalText.length));
	}
});