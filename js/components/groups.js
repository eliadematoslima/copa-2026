// js/components/groups.js
import { groupsData } from '../data/teams.js';
import { matchesData } from '../data/matches.js';
import { calculateGroupTable } from '../core/engine.js';

export function renderGroupsView() {
    const container = document.getElementById('grupos');
    if (!container) return;

    container.innerHTML = '<h2>Fase de Grupos</h2>';

    const groupsGrid = document.createElement('div');
    groupsGrid.className = 'groups-grid';

    Object.keys(groupsData).forEach(groupLetter => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.setAttribute('data-group', groupLetter);

        let htmlContent = `
            <h3>Grupo ${groupLetter}</h3>
            <table class="group-table" id="table-${groupLetter}">
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
                    </tbody>
            </table>
            
            <div class="group-matches">
                <h4>Jogos</h4>
        `;

        const groupMatches = matchesData[groupLetter];
        
        groupMatches.forEach(match => {
            const t1 = groupsData[groupLetter].find(t => t.id === match.team1);
            const t2 = groupsData[groupLetter].find(t => t.id === match.team2);

            htmlContent += `
                <div class="match-row">
                    <div class="match-team team-left">
                        <span class="team-name-short">${t1.name}</span>
                        <img class="flag-img" src="${t1.flag}">
                    </div>
                    
                    <div class="match-score-inputs">
                        <input type="number" min="0" class="score-input" 
                            data-group="${groupLetter}" data-match="${match.id}" data-team="1" 
                            value="${match.score1 ?? ''}" placeholder="-"> <!-- <-- Alterado para pegar match.score1 -->
                        <span class="x">x</span>
                        <input type="number" min="0" class="score-input" 
                            data-group="${groupLetter}" data-match="${match.id}" data-team="2" 
                            value="${match.score2 ?? ''}" placeholder="-"> <!-- <-- Alterado para pegar match.score2 -->
                    </div>
                    
                    <div class="match-team team-right">
                        <img class="flag-img" src="${t2.flag}">
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

    // Garante a inserção na tela antes do cálculo
    container.appendChild(groupsGrid);

    // Renderiza os dados iniciais corretos
    Object.keys(groupsData).forEach(groupLetter => {
        updateGroupTableHTML(groupLetter);
    });
}

export function updateGroupTableHTML(groupLetter) {
    const tbody = document.querySelector(`#table-${groupLetter} tbody`);
    if (!tbody) return;

    const sortedData = calculateGroupTable(groupLetter, matchesData[groupLetter]);
    
    let rowsHTML = '';
    sortedData.forEach((stats, index) => {
        const teamInfo = groupsData[groupLetter].find(t => t.id === stats.id);

        rowsHTML += `
            <tr>
                <td class="team-cell">
                    <span class="position">${index + 1}º</span>
                    <img class="flag-img" src="${teamInfo.flag}">
                    <span class="team-name">${teamInfo.name}</span>
                </td>
                <td><strong>${stats.P}</strong></td>
                <td>${stats.J}</td>
                <td>${stats.SG}</td>
                <td>${stats.GP}</td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHTML;
}