// js/components/bracket.js
import { groupsData } from '../data/teams.js';
import { matchesData } from '../data/matches.js';
import { generateRoundOf32 } from '../core/engine.js';

// Estado global simples para salvar os placares dos 16avos de final
export const knockoutPlacards = {};

// Helper para buscar nome e bandeira de um time por ID vasculhando os grupos
function findTeamInfo(teamId) {
    if (!teamId) return { name: "A definir", flag: "https://flagcdn.com/un.svg" }; // Bandeira da ONU/vazia para fallback
    for (const group of Object.values(groupsData)) {
        const found = group.find(t => t.id === teamId);
        if (found) return found;
    }
    return { name: "A definir", flag: "https://flagcdn.com/un.svg" };
}

// js/components/bracket.js - Modifique o início das duas funções:

export function renderBracketView() {
    // Ajustado para o ID correto da aba do seu index.html
    const container = document.getElementById('fase-16avos') || document.getElementById('fase-16avos') || document.getElementById('fase-16');
    if (!container) return;

    container.innerHTML = `
        <h2>16avos de Final (Fase de 32)</h2>
        <p style="color: #718096; margin-bottom: 1.5rem; font-size: 0.9rem;">
            Os confrontos abaixo são gerados automaticamente com base na matriz oficial da FIFA de cruzamento de grupos e melhores terceiros.
        </p>
        <div class="bracket-grid" id="bracket-r32-container">
            <!-- Injetado via JS -->
        </div>
    `;

    updateBracketHTML();
}

export function updateBracketHTML() {
    const gridContainer = document.getElementById('bracket-r32-container');
    if (!gridContainer) return;

    const roundOf32Matches = generateRoundOf32(matchesData);
    let html = '';

    roundOf32Matches.forEach(match => {
        const t1 = findTeamInfo(match.t1);
        const t2 = findTeamInfo(match.t2);

        // Resgata placares existentes ou deixa vazio
        const score1 = knockoutPlacards[match.id]?.score1 ?? '';
        const score2 = knockoutPlacards[match.id]?.score2 ?? '';

        html += `
            <div class="knockout-match-card">
                <div class="match-label">${match.label}</div>
                
                <div class="knockout-team-row">
                    <div class="team-meta">
                        <img class="flag-img" src="${t1.flag}" alt="">
                        <span class="team-name">${t1.name}</span>
                    </div>
                    <input type="number" min="0" class="score-input knockout-input" 
                        data-match="${match.id}" data-team="1" value="${score1}" placeholder="-">
                </div>

                <div class="knockout-team-row">
                    <div class="team-meta">
                        <img class="flag-img" src="${t2.flag}" alt="">
                        <span class="team-name">${t2.name}</span>
                    </div>
                    <input type="number" min="0" class="score-input knockout-input" 
                        data-match="${match.id}" data-team="2" value="${score2}" placeholder="-">
                </div>
            </div>
        `;
    });

    gridContainer.innerHTML = html;
}