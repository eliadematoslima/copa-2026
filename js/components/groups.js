// js/components/groups.js
import { groupsData } from '../data/teams.js';

export function renderGroupsView() {
    const container = document.getElementById('grupos');
    if (!container) return;

    // Limpa o conteúdo estático inicial
    container.innerHTML = '<h2>Fase de Grupos</h2>';

    // Grid que vai envelopar todos os 12 grupos
    const groupsGrid = document.createElement('div');
    groupsGrid.className = 'groups-grid';

    // Percorre cada grupo (A, B, C...) de groupsData
    Object.keys(groupsData).forEach(groupLetter => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';

        let tableHTML = `
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

        // Renderiza as 4 seleções do grupo (inicialmente tudo zerado)
        groupsData[groupLetter].forEach((team, index) => {
            tableHTML += `
                <tr>
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

        tableHTML += `
                </tbody>
            </table>
        `;

        groupCard.innerHTML = tableHTML;
        groupsGrid.appendChild(groupCard);
    });

    container.appendChild(groupsGrid);
}