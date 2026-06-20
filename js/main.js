// js/main.js
import { renderGroupsView, updateGroupTableHTML } from './components/groups.js';
import { matchesData } from './data/matches.js';

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderGroupsView();
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
        });
    });
}

// Escuta as alterações nos inputs de gols
function initMatchInputs() {
    const container = document.getElementById('grupos');
    if (!container) return;

    // Usa delegação de eventos para escutar inputs dinâmicos de forma performática
    container.addEventListener('input', (e) => {
        if (!e.target.classList.contains('score-input')) return;

        const input = e.target;
        const groupLetter = input.getAttribute('data-group');
        const matchId = input.getAttribute('data-match');
        const teamIndex = input.getAttribute('data-team'); // "1" ou "2"
        const val = input.value;

        // Localiza a partida no nosso estado global de dados
        const match = matchesData[groupLetter].find(m => m.id === matchId);
        
        if (match) {
            // Se o campo for limpo, define como null, senão guarda o número
            const scoreValue = val === '' ? null : parseInt(val);
            
            if (teamIndex === "1") {
                match.score1 = scoreValue;
            } else {
                match.score2 = scoreValue;
            }

            // Dispara o recálculo e a atualização visual somente para esse grupo
            updateGroupTableHTML(groupLetter);
        }
    });
}