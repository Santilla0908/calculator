const historyEl = document.querySelector('.button_history');
const inputEl = document.querySelector('.input');
const result = document.querySelector('.result');
const historyContainer = document.querySelector('.history_container');
const textEl = historyContainer.querySelector('.history_text');
const buttonsContainer = document.querySelector('.buttons');

historyEl.addEventListener('click', () => {
	const isShow = historyContainer.classList.toggle('show');
	if (isShow) {
		buttonsContainer.style.display = 'none';
	} else {
		buttonsContainer.style.display = 'grid';
	}
});

const deleteHistory = document.querySelector('.button_history_delete');

deleteHistory.addEventListener('click', () => {
	textEl.innerText = '';
	localStorage.removeItem('calcHistory');
});

const state = {
	expression: '',
	history: JSON.parse(localStorage.getItem('calcHistory') || [])
};

const pushHistoryEntry = (type, text) => {
	const time = new Date().toISOString();
	const entry = `${time} | ${type.toUpperCase()} | ${text}`;
	state.history.unshift(entry);
	if (state.history.length > 200) state.history.length = 200;
	localStorage.setItem('calcHistory', JSON.stringify(state.history));
}





