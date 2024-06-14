// ==UserScript==
// @name         PokeRogue-Pokedex-Translator
// @namespace    https://github.com/manhattanhouse/poke_kor
// @version      2.5
// @description  Translate PokeRogue Pokedex entries to Korean
// @author       manhattanhouse
// @match        https://ydarissep.github.io/PokeRogue-Pokedex/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.io
// @grant        none
// @run-at       document-idle
// @license      MIT
// @downloadURL  https://greasyfork.org/ko/scripts/497838-pokerogue-pokedex-translator
// @updateURL    https://github.com/manhattanhouse/poke_kor
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
        mainScript();
        function mainScript() {
            const searchInput = document.querySelector('#speciesInput');
            const searchInput_move = document.querySelector('#movesInput');
            const searchInput_location = document.querySelector('#locationsInput');

            addButtonsEventListener();

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
                    } else if (typeCell.className && typeCell.className.includes('TYPE_')) {
                        const key = lowerText(typeCell.className.split(' ')[0].replace('TYPE_', ''));
                        typeCell.textContent = translations.types[key];
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

            function translateMovesRow(row) {
                const moveCell = row.querySelector('.move');
                const originalMoveText = moveCell.textContent.replace(/\(.\)/, '').trim();
                const moveData = translations.moves[originalMoveText];
                if (moveData) {
                    moveCell.textContent = moveData.name_kr;
                    const descriptionCell = row.querySelector('.description div');
                    if (descriptionCell) {
                        descriptionCell.textContent = moveData.Effect_kr;
                    }

                    const effectCell = row.querySelector('.effect');
                    if (effectCell) {
                        const originalEffectText = effectCell.textContent.trim();
                        const effectTranslation = translations.move_effect.find(effect => effect[0] === originalEffectText);
                        if (effectTranslation) {
                            effectCell.textContent = effectTranslation[1];
                        }
                    }

                    const typeCell = row.querySelector('td.type div:first-child');
                    if (typeCell) {
                        const originalTypeText = typeCell.textContent.trim();
                        const translatedTypeText = translations.types[originalTypeText];
                        if (translatedTypeText) {
                            typeCell.textContent = translatedTypeText;
                        }
                    }
                }
            }

            function translateHeader(headers, translations) {
                headers.forEach(cell => {
                    const originalHeader = cell.textContent.trim();
                    const translatedHeader = translations[originalHeader];
                    if (translatedHeader) {
                        cell.textContent = translatedHeader;
                    }
                });
            }

            function translatePopup() {
                const popup = document.getElementById('popup');
                if (popup) {
                    const title = popup.querySelector('h2');
                    const moveData = translations.moves[title.textContent.trim()];
                    if (moveData) {
                        title.textContent = moveData.name_kr;

                        const description = popup.querySelector('.popupTrainerMoveDescription');
                        if (description) {
                            description.textContent = moveData.Effect_kr;
                        }

                        const statElements = popup.querySelectorAll('.popupTrainerMoveStat');
                        statElements.forEach(stat => {
                            Object.keys(translations.moves_head).forEach(key => {
                                if (stat.innerText.includes(key)) {
                                    stat.innerText = stat.innerText.replace(key, translations.moves_head[key]);
                                }
                            });
                        });

                        const effectElement = popup.querySelector('.popupTrainerMoveEffect');
                        if (effectElement) {
                            const originalEffectText = effectElement.textContent.trim();
                            const effectTranslation = translations.move_effect.find(effect => effect[0] === originalEffectText);
                            if (effectTranslation) {
                                effectElement.textContent = effectTranslation[1];
                            }
                        }

                        const typeElement = popup.querySelector('.popupTrainerMoveType');
                        if (typeElement) {
                            const originalTypeText = typeElement.textContent.trim();
                            const translatedTypeText = translations.types[originalTypeText];
                            if (translatedTypeText) {
                                typeElement.textContent = translatedTypeText;
                            }
                        }

                        const filterButton = popup.querySelector('.popupFilterButton');
                        if (filterButton) {
                            filterButton.textContent = '필터';
                        }

                        const filterLinks = popup.querySelectorAll('.hyperlink');
                        filterLinks.forEach(link => {
                            for (var filter of translations.move_filters) {
                                if (filter[0] == link.innerText) {
                                    link.innerText = filter[1];
                                    break;
                                }
                            }
                        });
                    }
                }
            }
            function observeElement(selector, callback) {
                const targetNode = document.body;

                const config = { childList: true, subtree: true };

                const callbackFunction = function(mutationsList, observer) {
                    for (let mutation of mutationsList) {
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

            function translateSpeciesFilterList() {
                const filterListItems = document.querySelectorAll('#speciesFilterList .tableFilter');
                const filterListItems_move = document.querySelectorAll('#movesFilterList .tableFilter');
                if (filterListItems) {
                    filterListItems.forEach(item => {
                        const spans = item.querySelectorAll('span');
                        if (spans.length >= 2) {
                            const firstSpan = spans[0];
                            const secondSpan = spans[1];
                            if (!secondSpan.hasAttribute('data-original-text')) {
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
                                } else if (className === 'Move') {
                                    firstSpan.textContent = '기술: ';
                                    for (let key in translations.moves) {
                                        let name = translations.moves[key].name;
                                        let name_kr = translations.moves[key].name_kr;
                                        if (name.includes(originalText)) {
                                            secondSpan.textContent = name_kr;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                if (filterListItems_move) {
                    filterListItems_move.forEach(item => {
                        const spans = item.querySelectorAll('span');
                        if (spans.length >= 2) {
                            const firstSpan = spans[0];
                            const secondSpan = spans[1];
                            if (!secondSpan.hasAttribute('data-original-text')) {
                                const className = firstSpan.className.trim();
                                const originalText = secondSpan.textContent.trim();
                                secondSpan.setAttribute('data-original-text', originalText);
                                for (var filter of translations.move_filters) {
                                    if (filter[0] == originalText) {
                                        secondSpan.textContent = filter[1];
                                    }
                                }
                                if (className === 'Split') {
                                    firstSpan.textContent = '분류: ';
                                } else if (className === 'Flag') {
                                    firstSpan.textContent = '플래그: ';
                                } else if (className === 'Target') {
                                    firstSpan.textContent = '목표: ';
                                } else if (className === 'Type') {
                                    firstSpan.textContent = '타입: ';
                                    const translatedType = translations.types[originalText];
                                    if (translatedType) {
                                        secondSpan.textContent = translatedType;
                                    }
                                }
                            }
                        }
                    });
                }
            }

            if (window.location.href.includes('?table=speciesTable')) {
                const speciesHeaderCells = document.querySelectorAll('#speciesTableThead th');
                translateHeader(speciesHeaderCells, translations.headers);

                const rows = document.querySelectorAll('#speciesTable tbody tr');
                rows.forEach(translateRow);

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

                const variantNode = document.querySelector('#onlyShowVariantPokemon');
                variantNode.innerText = '변종';

                translateSpeciesFilterList();
                observeElement('.tableFilter', translateSpeciesFilterList);

            } else if (window.location.href.includes('?table=movesTable')) {
                const moveHeaderCells = document.querySelectorAll('#movesTableThead th');
                translateHeader(moveHeaderCells, translations.moves_head);

                const moveRows = document.querySelectorAll('#movesTableTbody tr');
                moveRows.forEach(translateMovesRow);

                const observer = new MutationObserver(callbackMoves);
                const config = { childList: true, subtree: true };

                const targetNode = document.querySelector('#movesTableTbody');
                observer.observe(targetNode, config);

                function reverseTranslatorMove(query) {
                    if (translations.move_reverse[query]) {
                        return translations.move_reverse[query];
                    }
                    for (var filter of translations.move_filters) {
                        if (filter[1] == query) {
                            return filter[0];
                        }
                    }
                    for (var move in translations.moves) {
                        if (translations.moves[move].name_kr == query) {
                            return move;
                        }
                    }
                    for (var type in translations.types) {
                        if (translations.types[type] == query) {
                            return type;
                        }
                    }
                    return false;
                }

                searchInput_move.addEventListener('input', function() {
                    const query = searchInput_move.value.trim();
                    const reverseQuery = reverseTranslatorMove(query);
                    if (reverseQuery) {
                        setTimeout(() => {
                            searchInput_move.value = reverseQuery;
                            searchInput_move.blur();
                            searchInput_move.focus();
                        }, 0);
                    }
                });

                function callbackMoves(mutationsList, observer) {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach(node => {
                                if (node.nodeType === 1 && node.tagName === 'TR') {
                                    translateMovesRow(node);
                                }
                            });
                        }
                    }
                    const query = searchInput_move.value.trim();
                    if (query.length < 3) return;
                    const filterListItems = document.querySelectorAll('#movesFilterList .tableFilter');
                    filterListItems.forEach(item => {
                        const span = Array.from(item.querySelectorAll('span')).find(span => span.getAttribute('data-original-text') && span.getAttribute('data-original-text').includes(query));
                        if (span) {
                            item.classList.remove('hide');
                        }
                    });
                }

                const popupObserver = new MutationObserver(translatePopup);
                const popupConfig = { childList: true, subtree: true };
                const popupNode = document.getElementById('popup');
                if (popupNode) {
                    popupObserver.observe(popupNode, popupConfig);
                }

                translateSpeciesFilterList();
                observeElement('.tableFilter', translateSpeciesFilterList);
            } else if (window.location.href.includes('?species')) {
                speciesPage();
                const biomesCon = document.querySelector('#speciesPanelBiomesContainer');
                biomesCon.querySelector('.speciesPanelText').innerText = '바이옴:';
                const biomeLinks = biomesCon.querySelectorAll('.hyperlink');
                biomeLinks.forEach(link => {
                    if (translations.biomes[link.innerText]) {
                        link.innerText = translations.biomes[link.innerText];
                    }
                });
            } else if (window.location.href.includes('?table=locationsTable')) {
                const variantNode = document.querySelector('#onlyShowVariantPokemonLocations');
                variantNode.innerText = '변종';

                function transNodes(nodes, jsonData) {
                    nodes.forEach(node => {
                        if (jsonData[node.innerText]) {
                            node.innerText = jsonData[node.innerText];
                        }
                    });
                }
                const nameNodes = document.querySelectorAll('.locationSpeciesName');
                transNodes(nameNodes, translations.names);
                const rarityNodes = document.querySelectorAll('.rarityTableThead');
                transNodes(rarityNodes, translations.rarityHead);
                const locationNodes = document.querySelectorAll('.locationName');
                transNodes(locationNodes, translations.biomes);
                const previousLinkInfos = document.querySelectorAll('.previousLinkInfo');
                previousLinkInfos.forEach(node => {
                    const parts = node.innerText.split('\n');
                    if (translations.biomes[parts[0]]) {
                        node.innerText = translations.biomes[parts[0]] + '\n' + parts[1];
                    }
                });
                const nextLinkInfos = document.querySelectorAll('.nextLinkInfo');
                nextLinkInfos.forEach(node => {
                    const parts = node.innerText.split('\n');
                    if (translations.biomes[parts[0]]) {
                        node.innerText = translations.biomes[parts[0]] + '\n' + parts[1];
                    }
                });

                const timeData = {
                    "Dawn": "아침",
                    "Day": "낮",
                    "Dusk": "저녁",
                    "Night": "밤"
                }
                
                const timeNodes = document.querySelectorAll('.timeOfDay');
                transNodes(timeNodes, timeData);

                const filterListItems_location = document.querySelectorAll('#locationsFilterList .tableFilter');
                if (filterListItems_location) {
                    filterListItems_location.forEach(item => {
                        const spans = item.querySelectorAll('span');
                        if (spans.length >= 2) {
                            const firstSpan = spans[0];
                            const secondSpan = spans[1];
                            if (!secondSpan.hasAttribute('data-original-text')) {
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
                                } else if (className === 'Biome') {
                                    firstSpan.textContent = '바이옴: ';
                                    const translatedBiome = translations.biomes[originalText];
                                    if (translatedBiome) {
                                        secondSpan.textContent = translatedBiome;
                                    }
                                } else if (className === 'Move') {
                                    firstSpan.textContent = '기술: ';
                                    for (let key in translations.moves) {
                                        let name = translations.moves[key].name;
                                        let name_kr = translations.moves[key].name_kr;
                                        if (name.includes(originalText)) {
                                            secondSpan.textContent = name_kr;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                
                const observer = new MutationObserver(callbackLocation);
                const config = { childList: true, subtree: true };

                const targetNode = document.querySelector('#locationsTableTbody');
                observer.observe(targetNode, config);

                function filterTrans() {
                    const query = searchInput_location.value.trim();
                    if (query.length < 3) return;
                    const filterListItems = document.querySelectorAll('#locationsFilterList .tableFilter');
                    filterListItems.forEach(item => {
                        const span = Array.from(item.querySelectorAll('span')).find(span => span.getAttribute('data-original-text') && span.getAttribute('data-original-text').includes(query));
                        if (span) {
                            item.classList.remove('hide');
                        }
                    });
                }

                function callbackLocation(mutationsList, observer) {
                    filterTrans();
                }

                searchInput_location.addEventListener('input', function() {
                    const query = searchInput_location.value.trim();
                    let value = '';
                    if (reverseTranslations[query]) {
                        value = reverseTranslations[query];
                    } else {
                        for (var key in translations.biomes) {
                            if (query == translations.biomes[key]) {
                                value = key;
                            }
                        }
                        for (var key in translations.rarityHead) {
                            if (query == translations.rarityHead[key]) {
                                value = key;
                            }
                        }
                    }
                    if (value) {
                        setTimeout(() => {
                            searchInput_location.value = value;
                            searchInput_location.blur();
                            searchInput_location.focus();
                        }, 0);
                    }
                });
            }

            function speciesPage() {
                function transKey(selector, key) {
                    const element = document.querySelector(selector);
                    element.setAttribute('check', 'on');
                    let name_key = element.innerText;
                    if (key == 'types') name_key = lowerText(name_key);
                    if (element && translations[key][name_key]) {
                        element.innerText = translations[key][name_key];
                    }
                }
                function transText(selector, text) {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.innerText = text;
                    }
                }
                transKey('#speciesName', 'names');
                transKey('#speciesType1', 'types');
                transKey('#speciesType2', 'types');
                transKey('#speciesType3', 'types');
                transText('#speciesTypesText', '타입:');
                transText('#speciesEggGroupsText', '코스트:');
                transText('#speciesAbilitiesText', '특성:');
                transText('#speciesEvolutionsText', '진화:');
                transText('#speciesFormesText', '폼:');
        
                const abilities = document.querySelector('#speciesAbilities');
                const abilityLinks = abilities.querySelectorAll('span.hyperlink');
                abilityLinks.forEach(link => {
                    if (translations.abilities[link.innerText]) {
                        link.innerText = translations.abilities[link.innerText];
                    }
                });
        
                const stats = document.querySelector('#statsSection');
                let replaceNames = {
                    "Atk": "공격",
                    "Def": "방어",
                    "SpA": "특공",
                    "SpD": "특방",
                    "Spe": "속도",
                    "BST": "합계"
                };
                Object.entries(replaceNames).forEach(([key, value]) => {
                    const regex = new RegExp(key, 'g');
                    stats.innerHTML = stats.innerHTML.replace(regex, value);
                });
                /*
                const evolution = document.querySelector('#speciesEvoTable');
                replaceNames = {
                    "Level": "레벨",
                    "Mega": "메가",
                    "Giga": "거다이",
                    "item": "아이템"
                };
                if (evolution) {
                    Object.entries(replaceNames).forEach(([key, value]) => {
                        const regex = new RegExp(key, 'g');
                        evolution.innerHTML = evolution.innerHTML.replace(regex, value);
                    });
                }*/
        
                const formDiv = document.querySelector('#speciesFormes');
                if (formDiv) {
                    const forms = formDiv.querySelectorAll('.underline');
                    forms.forEach(form => {
                        if (translations.names[form.innerText]) {
                            form.innerText = translations.names[form.innerText];
                        }
                    });
                }
        
                const defensive = document.querySelector('#speciesDefensiveTypeChartContainer');
                defensive.querySelector('.bold').innerText = "공격받을 때";
                const offensive = document.querySelector('#speciesOffensiveTypeChartContainer');
                offensive.querySelector('.bold').innerText = "공격할 때";
                let types = defensive.querySelectorAll('.backgroundSmall');
                types.forEach(type => {
                    const type_name = type.className.split(' ')[1]
                    if (type_name.includes('TYPE')) {
                        const key = lowerText(type_name.replace('TYPE_', ''));
                        if (translations.types[key]) {
                            type.innerText = translations.types[key];
                        }
                    }
                });
                types = offensive.querySelectorAll('.backgroundSmall');
                types.forEach(type => {
                    const type_name = type.className.split(' ')[1]
                    if (type_name.includes('TYPE')) {
                        const key = lowerText(type_name.replace('TYPE_', ''));
                        if (translations.types[key]) {
                            type.innerText = translations.types[key];
                        }
                    }
                });
                
                const moveTables = document.querySelectorAll('.speciesPanelLearnsetsTableMargin');
                let transTexts = {
                    "Egg Moves": "유전 기술",
                    "Level-Up": "레벨업",
                    "TM/HM": "기술머신/비전머신"
                };            
                moveTables.forEach(table => {
                    let shift = 0;
                    const ths = table.querySelector('thead').querySelectorAll('th');
                    ths.forEach(th => {
                        if (translations.moves_head[th.innerText]) {
                            th.innerText = translations.moves_head[th.innerText];
                        } else if (th.innerText == 'Level' || th.innerText == '레벨') {
                            th.innerText = '레벨';
                            shift = 1;
                        }
                    });
                    const caption = table.querySelector('caption.bold');
                    const text = caption.innerHTML.split('\n')[0].trim();
                    if (transTexts[text]) {
                        caption.innerHTML = caption.innerHTML.replace(text, transTexts[text]);
                    }
                    const moveRows = table.querySelectorAll('tr');
                    moveRows.forEach(row => {
                        const cells = row.querySelectorAll('td');
                        const nameCell = cells[0+shift];
                        if (nameCell) {
                            const effectCell = cells[6+shift];
                            let move = null;
                            for (var name_key in translations.moves) {
                                if (translations.moves[name_key].name == nameCell.innerText) {
                                    move = translations.moves[name_key];
                                }
                            }
                            if (move) {
                                nameCell.innerText = move.name_kr;
                                if (move.Effect_kr) {
                                    if (move.Effect_kr.includes(". ")) {
                                        const parts = move.Effect_kr.replace(". ", ". \n").split("\n");
                                        effectCell.innerHTML = parts.map(part => `<div>${part}</div>`).join("");
                                    } else {
                                        const parts = splitMiddle(move.Effect_kr, 35);
                                        effectCell.innerHTML = parts.map(part => `<div>${part}</div>`).join("");
                                    }
                                }
                            }
                            const typeCell = cells[1+shift];
                            const typeDiv = typeCell.querySelector('div');
                            if (typeDiv) {
                                const type = typeDiv.className.split(' ')[0].replace('TYPE_', '');
                                const key = lowerText(type);
                                if (translations.types[key]) {
                                    typeDiv.innerText = translations.types[key]
                                }
                            }
                        }
                    });
                });
            }
            /*
            const nameNode = document.querySelector('#speciesName');
            const config = { childList: true, subtree: true, characterData: true };
            const cooldownTime = 100;
            let isCooldown = false;
            const callback = function(mutationsList, observer) {
                if (isCooldown) {
                    return;
                }
                speciesPage();
                isCooldown = true;
                setTimeout(() => {
                    isCooldown = false;
                }, cooldownTime);
            };
            const observer = new MutationObserver(callback);
            observer.observe(nameNode, config);*/
            const observer = new MutationObserver(checkUrlChange);
            observer.observe(document, { childList: true, subtree: true });
        }
    
        let previousUrl = window.location.href;
        let tableHeight = 0;
        function checkUrlChange() {
            const currentUrl = window.location.href;
            const currentHeight = document.querySelector("#table").offsetHeight;
            if (currentUrl !== previousUrl || currentHeight !== tableHeight) {
                previousUrl = currentUrl;
                tableHeight = currentHeight;
                mainScript();
            }
        }
    }

    function lowerText(text) {
        return text.charAt(0) + text.slice(1).toLowerCase();
    }

    function addButtonsEventListener() {
        const tableButtonDiv = document.getElementById('tableButton');
        const buttons = tableButtonDiv.getElementsByTagName('button');
        let buttonTexts = [
            "특성", "포켓몬", "기술", "바이옴", "트레이너", "아이템"
        ];
        var count = 0;
        for (let button of buttons) {
            button.innerText = buttonTexts[count];
            count += 1; /*
            button.addEventListener('click', function() {
                main();
            }); */
        }
    }
    setTimeout(main, 1000);

    function splitMiddle(text, maxLength) {
        if (text.length <= maxLength) {
            return [text];
        }
        const middle = Math.floor(text.length / 2);
        let left = middle;
        let right = middle;
    
        while (left > 0 && text[left] !== ' ') {
            left--;
        }
        while (right < text.length && text[right] !== ' ') {
            right++;
        }

        const splitIndex = (middle - left <= right - middle) ? left : right;
        const part1 = text.substring(0, splitIndex);
        const part2 = text.substring(splitIndex + 1);
        return [part1, part2];
    }
})();
