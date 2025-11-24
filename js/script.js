const historyEl = document.querySelector('.button_history');
const inputEl = document.querySelector('.input');
const result = document.querySelector('.result');
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

/*const pushHistoryEntry = (text) => {
	localStorage.setItem('calcHistory', JSON.stringify(state.history));
}*/

const renderInput = () => {
	inputEl.value = state.expression;
}

const renderResult = (text) => {
	result.innerText = text === undefined ? '' : String(text);
}

const safeEvaluate = (expression) => {
	if (expression.includes('=')) {
		const parts = expression.split('=');
		expression = parts[parts.length -1].trim();
	}
	
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
		result.innerText = 'Введите выражение';
		return;
	}

	try {
		let expression = state.expression;
		const calculatedResult = safeEvaluate(expression);
		renderResult(calculatedResult);
		state.expression = `${expression} = ${calculatedResult}`;
		renderInput();

		state.history.push(`${expression} = ${calculatedResult}`);
		localStorage.setItem('calcHistory', JSON.stringify(state.history));

	} catch (error) {
		console.log(`Ошибка вычисления:`, error);

		if (error.message.includes(`Деление на ноль`)) {
			result.innerText = `Деление на ноль невозможно`;
		}  else if (error.message.includes(`не завершено`)) {
			result.innerText = `Выражение не завершено`;
		} else {
			result.innerText = 'Ошибка вычисления';
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
		renderInput();
	}
	else if (action === 'operator') {
		state.expression += value;
		renderInput();
	}
	else if (action === 'backspace') {
		state.expression = state.expression.slice(0, -1);
		renderInput();
	}
	else if (action === 'clear') {
		state.expression = '';
		renderInput();
		result.innerText = '';
	}
	else if (action === 'equals') {
		calculatorResult();
	}
});




