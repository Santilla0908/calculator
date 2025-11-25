const historyEl = document.querySelector('.button_history');
const historyDisplayEl = document.querySelector('.history_display');
const currentExpressionEl = document.querySelector('.current_expression');
const historyContainer = document.querySelector('.history_container');
const textEl = historyContainer.querySelector('.history_text');
const buttonsContainer = document.querySelector('.buttons');
const deleteHistory = document.querySelector('.button_history_delete');

const state = {
	expression: '',
	history: JSON.parse(localStorage.getItem('calcHistory') || '[]')
};

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
	if (!state.expression.trim()) {
		currentExpressionEl.innerText = 'Введите выражение';
		return;
	}

	try {
		let expression = state.expression;
		let finalOperator = '';

		const lastCharacter = expression.slice(-1);
		if (['+', '-', '*', '/'].includes(lastCharacter)) {
			finalOperator = lastCharacter;
			expression = expression.slice(0, -1);
		}

		const calculatedResult = safeEvaluate(expression);

		const historyExpression = state.expression;
		updateHistoryDisplay(`${historyExpression} = ${calculatedResult}`)

		state.expression = calculatedResult + finalOperator;
		currentExpressionEl.innerText = state.expression;

	} catch (error) {
		console.log(`Ошибка вычисления:`, error);

		if (error.message.includes(`Деление на ноль`)) {
			currentExpressionEl.innerText = `Деление на ноль невозможно`;
		}  else if (error.message.includes(`не завершено`)) {
			currentExpressionEl.innerText = `Выражение не завершено`;
		} else {
			currentExpressionEl.innerText = 'Ошибка вычисления';
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
		state.expression += value;
		currentExpressionEl.innerText = state.expression;
	}
	else if (action === 'operator') {
		state.expression += value;
		currentExpressionEl.innerText = state.expression;
	}
	else if (action === 'backspace') {
		state.expression = state.expression.slice(0, -1);
		currentExpressionEl.innerText = state.expression;
	}
	else if (action === 'clear') {
		state.expression = '';
		state.history = [];
		historyDisplayEl.innerText = '';
		currentExpressionEl.innerText = '';
		localStorage.removeItem('calcHistory');
	}
	else if (action === 'equals') {
		calculatorResult();
	}
});




