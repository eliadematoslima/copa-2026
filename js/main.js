// js/main.js
import { renderFinalStagesView, updateFinalStagesHTML } from './components/finalStages.js';
import { renderGroupsView, updateGroupTableHTML } from './components/groups.js';
import { renderThirdsView, updateThirdsTableHTML } from './components/thirds.js';
import { renderBracketView, updateBracketHTML, knockoutPlacards } from './components/bracket.js';
import { matchesData } from './data/matches.js';

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData(); // <-- 1. Carrega os dados salvos antes de renderizar as telas
    
    initTabs();
    renderGroupsView();
    renderThirdsView();
    renderBracketView();
    renderFinalStagesView();
    initMatchInputs();
    initKnockoutInputs();
    
    // Atualiza as tabelas iniciais com base nos dados carregados
    Object.keys(matchesData).forEach(groupLetter => {
        updateGroupTableHTML(groupLetter);
    });
});

// FUNÇÃO PARA CARREGAR DADOS DO LOCALSTORAGE
function loadSavedData() {
    // Carrega placares da fase de grupos
    const savedGroups = localStorage.getItem('copa2026_groups_matches');
    if (savedGroups) {
        const parsed = JSON.parse(savedGroups);
        Object.keys(parsed).forEach(group => {
            if (matchesData[group]) {
                parsed[group].forEach((savedMatch, index) => {
                    if (matchesData[group][index]) {
                        matchesData[group][index].score1 = savedMatch.score1;
                        matchesData[group][index].score2 = savedMatch.score2;
                    }
                });
            }
        });
    }

    // Carrega placares dos 16avos de final
    const savedKnockout = localStorage.getItem('copa2026_knockout_matches');
    if (savedKnockout) {
        const parsed = JSON.parse(savedKnockout);
        Object.assign(knockoutPlacards, parsed);
    }
}

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
                updateBracketHTML();
            }
            if (targetTab === 'fases-finais') {
                updateFinalStagesHTML();
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
            
            // <-- 2. Salva automaticamente a Fase de Grupos a cada alteração
            localStorage.setItem('copa2026_groups_matches', JSON.stringify(matchesData));
        }
    });
}

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
        
        // <-- 3. Salva automaticamente os 16avos de final a cada alteração
        localStorage.setItem('copa2026_knockout_matches', JSON.stringify(knockoutPlacards));
    });
}