// ==UserScript==
// @name         PokeRogue-Pokedex-Translator
// @namespace    https://github.com/manhattanhouse/poke_kor
// @version      2024-06-13.1
// @description  Translate PokeRogue Pokedex entries to Korean
// @author       manhattanhouse
// @match        https://ydarissep.github.io/PokeRogue-Pokedex/?table=speciesTable*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.io
// @grant        none
// @run-at       document-idle
// @license      MIT
// ==/UserScript==
 
(function() {
    'use strict';
 
    async function fetchJsonData(url) {
        const response = await fetch(url);
        return await response.json();
    }
 
    async function main() {
        const json_url = "https://raw.githubusercontent.com/manhattanhouse/poke_kor/main/poke_trans.json";
 
        const translations = await fetchJsonData(json_url);
        const reverseTranslations = translations.reverse;
 
        const searchInput = document.querySelector('#speciesInput');
 
        function translateRow(row) {
            const nameCell = row.querySelector('.nameContainer .species');
            const typeCells = row.querySelectorAll('.types .background');
            const abilityCells = row.querySelectorAll('.abilities div');
 
            const originalName = nameCell.textContent.trim();
            const translatedName = translations.names[originalName];
            if (translatedName) {
                nameCell.textContent = translatedName;
            }
 
            typeCells.forEach(typeCell => {
                const originalType = typeCell.textContent.trim();
                const translatedType = translations.types[originalType];
                if (translatedType) {
                    typeCell.textContent = translatedType;
                }
            });
 
            abilityCells.forEach(abilityCell => {
                const originalAbility = abilityCell.textContent.trim();
                const translatedAbility = translations.abilities[originalAbility];
                if (translatedAbility) {
                    abilityCell.textContent = translatedAbility;
                }
            });
 
            const statCells = row.querySelectorAll('.italic');
            statCells.forEach(statCell => {
                const originalStat = statCell.textContent.trim();
                const translatedStat = translations.headers[originalStat];
                if (translatedStat) {
                    statCell.textContent = translatedStat;
                }
            });
        }
 
        const rows = document.querySelectorAll('#speciesTable tbody tr');
        rows.forEach(translateRow);
 
        function callback(mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.tagName === 'TR') {
                            translateRow(node);
                        }
                    });
                }
            }
            const query = searchInput.value.trim();
            if (query.length < 3) return;
            const filterListItems = document.querySelectorAll('#speciesFilterList .tableFilter');
            filterListItems.forEach(item => {
                const span = Array.from(item.querySelectorAll('span')).find(span => span.getAttribute('data-original-text') && span.getAttribute('data-original-text').includes(query));
                if (span) {
                    item.classList.remove('hide');
                }
            });
        }
 
        function translateHeader() {
            const headerCells = document.querySelectorAll('#speciesTableThead th');
            headerCells.forEach(cell => {
                const originalHeader = cell.textContent.trim();
                const translatedHeader = translations.headers[originalHeader];
                if (translatedHeader) {
                    cell.textContent = translatedHeader;
                }
            });
        }
 
        translateHeader();
 
        const observer = new MutationObserver(callback);
        const config = { childList: true, subtree: true };
 
        const targetNode = document.querySelector('#speciesTable tbody');
        observer.observe(targetNode, config);
 
        searchInput.addEventListener('input', function() {
            const query = searchInput.value.trim();
            if (reverseTranslations[query]) {
                setTimeout(() => {
                    searchInput.value = reverseTranslations[query];
                    searchInput.blur();
                    searchInput.focus();
                }, 0);
            }
        });
 
        function translateSpeciesFilterList() {
            const filterListItems = document.querySelectorAll('#speciesFilterList .tableFilter');
            filterListItems.forEach(item => {
                const spans = item.querySelectorAll('span');
                if (spans.length >= 2) {
                    const firstSpan = spans[0];
                    const secondSpan = spans[1];
                    const className = firstSpan.className.trim();
                    const originalText = secondSpan.textContent.trim();
                    secondSpan.setAttribute('data-original-text', originalText); // Store original text in data attribute
                    if (className === 'Form') {
                        firstSpan.textContent = '폼: ';
                        const translatedForm = translations.form[originalText];
                        if (translatedForm) {
                            secondSpan.textContent = translatedForm;
                        }
                    } else if (className === 'Type') {
                        firstSpan.textContent = '타입: ';
                        const translatedType = translations.types[originalText];
                        if (translatedType) {
                            secondSpan.textContent = translatedType;
                        }
                    } else if (className === 'Ability') {
                        firstSpan.textContent = '어빌리티: ';
                        const translatedAbility = translations.abilities[originalText];
                        if (translatedAbility) {
                            secondSpan.textContent = translatedAbility;
                        }
                    }
                }
            });
        }
 
        function observeElement(selector, callback) {
            const targetNode = document.body;
 
            const config = { childList: true, subtree: true };
 
            const callbackFunction = function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        const element = document.querySelector(selector);
                        if (element) {
                            observer.disconnect();
                            setTimeout(() => {
                                callback();
                            }, 1000);
                            break;
                        }
                    }
                }
            };
 
            const observer = new MutationObserver(callbackFunction);
 
            observer.observe(targetNode, config);
        }
 
        observeElement('.tableFilter', translateSpeciesFilterList);
    }
 
    main();
})();
