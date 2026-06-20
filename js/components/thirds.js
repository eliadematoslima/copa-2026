// js/components/thirds.js
import { groupsData } from '../data/teams.js';
import { matchesData } from '../data/matches.js';
import { calculateAllThirdPlaces } from '../core/engine.js';

export function renderThirdsView() {
    const container = document.getElementById('terceiros');
    if (!container) return;

    container.innerHTML = `
        <h2>Classificação dos Melhores 3º Colocados</h2>
        <p style="color: #718096; margin-bottom: 1rem; font-size: 0.9rem;">
            Os 8 melhores terceiros colocados avançam para a Fase de 16avos de Final.
        </p>
        <table class="group-table thirds-table" id="table-thirds">
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Grupo</th>
                    <th>Seleção</th>
                    <th>P</th>
                    <th>J</th>
                    <th>SG</th>
                    <th>GP</th>
                </tr>
            </thead>
            <tbody>
                </tbody>
        </table>
    `;

    updateThirdsTableHTML();
}

export function updateThirdsTableHTML() {
    const tbody = document.querySelector('#table-thirds tbody');
    if (!tbody) return;

    const orderedThirds = calculateAllThirdPlaces(matchesData);

    let rowsHTML = '';
    orderedThirds.forEach((stats, index) => {
        const teamInfo = groupsData[stats.group].find(t => t.id === stats.id);
        
        // Os 8 primeiros ganham a classe 'qualified' (vão para o mata-mata)
        // Os 4 últimos ganham a classe 'eliminated'
        const rowClass = index < 8 ? 'qualified-row' : 'eliminated-row';

        rowsHTML += `
            <tr class="${rowClass}">
                <td><strong>${index + 1}º</strong></td>
                <td><span class="group-badge">Grupo ${stats.group}</span></td>
                <td class="team-cell">
                    <img class="flag-img" src="${teamInfo.flag}" alt="">
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