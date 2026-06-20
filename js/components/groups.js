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
                        <span class="flag">${t1.flag}</span>
                    </div>
                    
                    <div class="match-score-inputs">
                        <input type="number" min="0" class="score-input" data-group="${groupLetter}" data-match="${match.id}" data-team="1" placeholder="-">
                        <span class="x">x</span>
                        <input type="number" min="0" class="score-input" data-group="${groupLetter}" data-match="${match.id}" data-team="2" placeholder="-">
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

        // ... código anterior do Object.keys(groupsData).forEach ...
        
        groupCard.innerHTML = htmlContent;
        groupsGrid.appendChild(groupCard);
    });

    // 1º ENTRA NA TELA: Anexa a grade completa ao container principal primeiro
    container.appendChild(groupsGrid);

    // 2º DEPOIS ATUALIZA: Agora que os elementos existem no DOM, rodamos o cálculo inicial
    Object.keys(groupsData).forEach(groupLetter => {
        updateGroupTableHTML(groupLetter);
    });
}

// Atualiza apenas as linhas da tabela de um grupo específico mantendo a ordem correta
export function updateGroupTableHTML(groupLetter) {
    const tbody = document.querySelector(`#table-${groupLetter} tbody`);
    if (!tbody) return;

    // Calcula a tabela ordenada atualizada usando a Engine
    const sortedData = calculateGroupTable(groupLetter, matchesData[groupLetter]);
    
    let rowsHTML = '';
    sortedData.forEach((stats, index) => {
        // Encontra o nome e bandeira do time correspondente
        const teamInfo = groupsData[groupLetter].find(t => t.id === stats.id);

        rowsHTML += `
            <tr>
                <td class="team-cell">
                    <span class="position">${index + 1}º</span>
                    <span class="flag">${teamInfo.flag}</span>
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