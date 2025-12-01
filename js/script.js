const historyEl = document.querySelector('.button_history');
const historyDisplayEl = document.querySelector('.history_display');
const currentInputEl = document.querySelector('.current_expression_input');
const historyContainer = document.querySelector('.history_container');
const textEl = historyContainer.querySelector('.history_text');
const buttonsContainer = document.querySelector('.buttons');
const deleteHistory = document.querySelector('.button_history_delete');

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

const safeEvaluate = (expression) => {
	
	const tokens = expression.match(/(\d+\.?\d*|[\+\-\*\/])/g);

	let current = new Big(tokens[0]);

	for (let i = 1; i < tokens.length; i += 2) {
		const operator = tokens[i];
		const nextNumber = tokens[i + 1];

		if (!nextNumber) {
			throw new Error(`Выражение не завершено`);
		}

		const nextBig = new Big(nextNumber);

		switch (operator) {
			case '+': current = current.plus(nextBig); break;
			case '-': current = current.minus(nextBig); break;
			case '*': current = current.times(nextBig); break;
			case '/':
				if (nextBig.eq(0)) throw new Error(`Деление на ноль`);
				current = current.div(nextBig);
				break;
		}
	}
	return current.toString();
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

		const calculatedResult = safeEvaluate(expressionToCalculate);

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
	else if (action === 'backspace') {
		const start = currentInputEl.selectionStart;
		const end = currentInputEl.selectionEnd;

		if (start !== end) {
			const before = getExpression().slice(0, start);
			const after = getExpression().slice(end);
			setExpression(before + after, start - 1);
		}
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




