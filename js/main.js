// js/main.js
import { renderGroupsView, updateGroupTableHTML } from './components/groups.js';
import { renderThirdsView, updateThirdsTableHTML } from './components/thirds.js'; // <-- Adicionado
import { matchesData } from './data/matches.js';

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderGroupsView();
    renderThirdsView(); // <-- Inicializa a estrutura da aba de terceiros
    initMatchInputs();
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

            // SE O USUÁRIO CLICAR NA ABA DE TERCEIROS, RECALCULA E ATUALIZA A TELA
            if (targetTab === 'terceiros') {
                updateThirdsTableHTML();
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
            
            if (teamIndex === "1") {
                match.score1 = scoreValue;
            } else {
                match.score2 = scoreValue;
            }

            updateGroupTableHTML(groupLetter);
        }
    });
}