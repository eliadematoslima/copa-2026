// js/main.js
import { renderGroupsView, updateGroupTableHTML } from './components/groups.js';
import { renderThirdsView, updateThirdsTableHTML } from './components/thirds.js';
import { renderBracketView, updateBracketHTML, knockoutPlacards } from './components/bracket.js'; // <-- Importado
import { matchesData } from './data/matches.js';

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderGroupsView();
    renderThirdsView();
    renderBracketView(); // <-- Inicializa a estrutura visual dos 16avos
    initMatchInputs();
    initKnockoutInputs(); // <-- Inicializa ouvintes do mata-mata
});

function initTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            buttons.forEach(btn => btn.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) targetContent.classList.add('active');

            if (targetTab === 'terceiros') {
                updateThirdsTableHTML();
            }
            if (targetTab === 'fase-16avos') {
                updateBracketHTML(); // <-- Garante o cálculo e atualização ao clicar na aba
            }
        });
    });
}

function initMatchInputs() {
    const container = document.getElementById('grupos');
    if (!container) return;

    container.addEventListener('input', (e) => {
        if (!e.target.classList.contains('score-input')) return;

        const input = e.target;
        const groupLetter = input.getAttribute('data-group');
        const matchId = input.getAttribute('data-match');
        const teamIndex = input.getAttribute('data-team');
        const val = input.value;

        const match = matchesData[groupLetter].find(m => m.id === matchId);
        
        if (match) {
            const scoreValue = val === '' ? null : parseInt(val);
            if (teamIndex === "1") match.score1 = scoreValue;
            else match.score2 = scoreValue;

            updateGroupTableHTML(groupLetter);
        }
    });
}

// Nova função para escutar placares do mata-mata
function initKnockoutInputs() {
    const container = document.getElementById('fase-16avos');
    if (!container) return;

    container.addEventListener('input', (e) => {
        if (!e.target.classList.contains('knockout-input')) return;

        const input = e.target;
        const matchId = input.getAttribute('data-match');
        const teamIndex = input.getAttribute('data-team');
        const val = input.value;

        if (!knockoutPlacards[matchId]) {
            knockoutPlacards[matchId] = { score1: null, score2: null };
        }

        knockoutPlacards[matchId][`score${teamIndex}`] = val === '' ? null : parseInt(val);
    });
}