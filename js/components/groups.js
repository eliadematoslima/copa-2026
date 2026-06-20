// js/components/groups.js
import { groupsData } from '../data/teams.js';
import { matchesData } from '../data/matches.js';

export function renderGroupsView() {
    const container = document.getElementById('grupos');
    if (!container) return;

    container.innerHTML = '<h2>Fase de Grupos</h2>';

    const groupsGrid = document.createElement('div');
    groupsGrid.className = 'groups-grid';

    Object.keys(groupsData).forEach(groupLetter => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';

        // 1. Monta a tabela de classificação (igual antes)
        let htmlContent = `
            <h3>Grupo ${groupLetter}</h3>
            <table class="group-table">
                <thead>
                    <tr>
                        <th>Classificação</th>
                        <th>P</th>
                        <th>J</th>
                        <th>SG</th>
                        <th>GP</th>
                    </tr>
                </thead>
                <tbody>
        `;

        groupsData[groupLetter].forEach((team, index) => {
            htmlContent += `
                <tr id="row-${team.id}">
                    <td class="team-cell">
                        <span class="position">${index + 1}º</span>
                        <span class="flag">${team.flag}</span>
                        <span class="team-name">${team.name}</span>
                    </td>
                    <td><strong>0</strong></td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
            `;
        });

        htmlContent += `
                </tbody>
            </table>
            
            <div class="group-matches">
                <h4>Jogos</h4>
        `;

        // Busca as partidas geradas dinamicamente para este grupo
        const groupMatches = matchesData[groupLetter];
        
        groupMatches.forEach(match => {
            // Busca os dados do time completo (nome e bandeira) usando o ID
            const t1 = groupsData[groupLetter].find(t => t.id === match.team1);
            const t2 = groupsData[groupLetter].find(t => t.id === match.team2);

            htmlContent += `
                <div class="match-row" data-match-id="${match.id}">
                    <div class="match-team team-left">
                        <span class="team-name-short">${t1.name}</span>
                        <span class="flag">${t1.flag}</span>
                    </div>
                    
                    <div class="match-score-inputs">
                        <input type="number" min="0" class="score-input" data-match="${match.id}" data-team="1" placeholder="-">
                        <span class="x">x</span>
                        <input type="number" min="0" class="score-input" data-match="${match.id}" data-team="2" placeholder="-">
                    </div>
                    
                    <div class="match-team team-right">
                        <span class="flag">${t2.flag}</span>
                        <span class="team-name-short">${t2.name}</span>
                    </div>
                </div>
            `;
        });

        htmlContent += `
            </div>
        `;

        groupCard.innerHTML = htmlContent;
        groupsGrid.appendChild(groupCard);
    });

    container.appendChild(groupsGrid);
}