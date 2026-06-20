// js/data/matches.js
import { groupsData } from './teams.js';

// Função para gerar as 6 partidas de um grupo de 4 times (Combinação clássica de torneios)
function generateGroupMatches(groupLetter, teams) {
    // Ordem clássica de confrontos:
    // Rodada 1: 1 vs 2, 3 vs 4
    // Rodada 2: 1 vs 3, 4 vs 2
    // Rodada 3: 4 vs 1, 2 vs 3
    const order = [
        [0, 1], [2, 3], // Rodada 1
        [0, 2], [3, 1], // Rodada 2
        [3, 0], [1, 2]  // Rodada 3
    ];

    return order.map((pair, index) => {
        const team1 = teams[pair[0]];
        const team2 = teams[pair[1]];
        return {
            id: `${groupLetter}-${index + 1}`,
            group: groupLetter,
            round: Math.ceil((index + 1) / 2),
            team1: team1.id,
            team2: team2.id,
            score1: null,
            score2: null
        };
    });
}

// Inicializa o objeto global de partidas para os 12 grupos
export function initializeMatches() {
    const allMatches = {};
    Object.keys(groupsData).forEach(groupLetter => {
        allMatches[groupLetter] = generateGroupMatches(groupLetter, groupsData[groupLetter]);
    });
    return allMatches;
}

// Instância única que será usada por toda a aplicação
export const matchesData = initializeMatches();