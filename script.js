// ==UserScript==
// @name         PokeRogue-Pokedex-Translator
// @namespace    https://github.com/manhattanhouse/poke_kor
// @version      3.0
// @description  PokeRogue Pokedex 항목을 한국어로 번역합니다.
// @author       manhattanhouse
// @match        https://ydarissep.github.io/PokeRogue-Pokedex/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.io
// @grant        none
// @run-at       document-idle
// @license      MIT
// @downloadURL  https://greasyfork.org/ko/scripts/497838-pokerogue-pokedex-translator
// @updateURL    https://github.com/manhattanhouse/poke_kor
// ==/UserScript==

(async function () {
    'use strict';

    const json_url = "https://raw.githubusercontent.com/manhattanhouse/poke_kor/main/poke_trans.json";
    const translations = await fetchJsonData(json_url);

    // JSON 데이터 fetch
    async function fetchJsonData(url) {
        const response = await fetch(url);
        return response.json();
    }

    // 첫 글자를 제외하고 소문자로 변경
    function lowerText(text) {
        return text.charAt(0) + text.slice(1).toLowerCase();
    }

    // 메뉴 번역
    function addButtonsEventListener() {
        const buttons = document.getElementById('tableButton').getElementsByTagName('button');
        const buttonTexts = ["특성", "포켓몬", "기술", "바이옴", "트레이너", "아이템"];
        Array.from(buttons).forEach((button, index) => {
            button.innerText = buttonTexts[index];
        });
    }

    // 셀 번역
    function translateCell(cell, translationDict, classPrefix = '') {
        const originalText = cell.textContent.trim();
        const translatedText = translationDict[originalText] || translationDict[lowerText(cell.className.split(' ')[0].replace(classPrefix, ''))];
        if (translatedText) {
            cell.textContent = translatedText;
        }
    }

    // 행 번역
    function translateRow(row, translations) {
        translateCell(row.querySelector('.nameContainer .species'), translations.names);
        row.querySelectorAll('.types .background').forEach(cell => translateCell(cell, translations.types, 'TYPE_'));
        row.querySelectorAll('.abilities div').forEach(cell => translateCell(cell, translations.abilities));
        row.querySelectorAll('.italic').forEach(cell => translateCell(cell, translations.headers));
    }

    // 기술 행 번역
    function translateMovesRow(row, translations) {
        const moveCell = row.querySelector('.move');
        const originalText = moveCell.textContent.trim();
        const matchedText = originalText.match(/\((.)\)/);
        const originalMoveText = moveCell.textContent.replace(/\(.\)/, '').trim();
        const moveData = translations.moves[originalMoveText];

        if (moveData) {
            if (matchedText) {
                moveCell.textContent = `${moveData.name_kr} (${matchedText[1]})`;
            } else {
                moveCell.textContent = moveData.name_kr;
            }
            const descriptionCell = row.querySelector('.description div');
            if (descriptionCell) descriptionCell.textContent = moveData.Effect_kr;

            const effectCell = row.querySelector('.effect');
            if (effectCell) {
                const effectTranslation = translations.move_effect.find(effect => effect[0] === effectCell.textContent.trim());
                if (effectTranslation) effectCell.textContent = effectTranslation[1];
            }

            translateCell(row.querySelector('td.type div:first-child'), translations.types);
        }
    }

    // 헤더 번역
    function translateHeader(headers, translations) {
        headers.forEach(cell => translateCell(cell, translations));
    }

    // 필터 목록 번역
    function translateSpeciesFilterList(tableFilters) {
        tableFilters.forEach(item => {
            const spans = item.querySelectorAll('span');
            if (spans.length >= 2) {
                const firstSpan = spans[0];
                const secondSpan = spans[1];
                if (!secondSpan.hasAttribute('data-original-text')) {
                    const originalText = secondSpan.textContent.trim();
                    secondSpan.setAttribute('data-original-text', originalText);
                    const className = firstSpan.className.trim();

                    const translationOptions = {
                        "Form": {
                            "text": "폼: ",
                            "data": translations.form
                        },
                        "Type": {
                            "text": "타입: ",
                            "data": translations.types
                        },
                        "Ability": {
                            "text": "특성: ",
                            "data": translations.abilities
                        },
                        "Biome": {
                            "text": "바이옴: ",
                            "data": translations.biomes
                        },
                        "Split": {
                            "text": "분류: "
                        },
                        "Flag": {
                            "text": "플래그: "
                        },
                        "Target": {
                            "text": "타겟: "
                        }
                    }

                    const option = translationOptions[className]
                    let translatedText = '';

                    if (option && option['data']) {
                        translatedText = option.data[originalText];
                        firstSpan.innerText = option.text;
                    } else if (option) {
                        for (var filter of translations.move_filters) {
                            if (filter[0] == originalText) {
                                translatedText = filter[1];
                                break;
                            }
                        }
                        firstSpan.innerText = option.text;
                    } else if (className == 'Move') {
                        Object.values(translations.moves).forEach(({ name, name_kr }) => {
                            if (name.includes(originalText)) {
                                translatedText = name_kr;
                            }
                        });
                        firstSpan.innerText = '기술: ';
                    }

                    if (translatedText) {
                        secondSpan.textContent = translatedText;
                    }
                }
            }
        });
    }

    // 팝업 번역
    function translatePopup(translations) {
        const popup = document.getElementById('popup');
        if (popup) {
            const title = popup.querySelector('h2');
            const originalText = title.textContent.trim();
            const matchedText = originalText.match(/\((.)\)/);
            const originalMoveText = title.textContent.replace(/\(.\)/, '').trim();
            const moveData = translations.moves[originalMoveText];
            if (moveData) {
                if (matchedText) {
                    title.textContent = `${moveData.name_kr} (${matchedText[1]})`;
                } else {
                    title.textContent = moveData.name_kr;
                }
                const description = popup.querySelector('.popupTrainerMoveDescription');
                if (description) description.textContent = moveData.Effect_kr;

                popup.querySelectorAll('.popupTrainerMoveStat').forEach(stat => {
                    Object.keys(translations.moves_head).forEach(key => {
                        if (stat.innerText.includes(key)) {
                            stat.innerText = stat.innerText.replace(key, translations.moves_head[key]);
                        }
                    });
                });

                const effectElement = popup.querySelector('.popupTrainerMoveEffect');
                if (effectElement) {
                    const effectTranslation = translations.move_effect.find(effect => effect[0] === effectElement.textContent.trim());
                    if (effectTranslation) effectElement.textContent = effectTranslation[1];
                }

                translateCell(popup.querySelector('.popupTrainerMoveType'), translations.types);
                popup.querySelector('.popupFilterButton').textContent = '필터';
                popup.querySelectorAll('.hyperlink').forEach(link => {
                    const filterTranslation = translations.move_filters.find(filter => filter[0] == link.innerText);
                    if (filterTranslation) link.innerText = filterTranslation[1];
                });
            }
        }
    }

    // 요소 관찰
    function observeElement(selector, callback) {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const element = document.querySelector(selector);
                    if (element) {
                        callback();
                        break;
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 노드 번역
    function translateNodes(nodes, jsonData) {
        nodes.forEach(node => {
            const translatedText = jsonData[node.innerText];
            if (translatedText) node.innerText = translatedText;
        });
    }

    // 선택자로 번역
    function transElement(selector, key, text = null) {
        const element = document.querySelector(selector);
        if (element) {
            if (text !== null) {
                element.innerText = text;
            } else {
                let name_key = element.innerText;
                if (key === 'types') name_key = lowerText(name_key);
                if (translations[key][name_key]) {
                    element.innerText = translations[key][name_key];
                }
            }
        }
    }

    let previousUrl = window.location.href;
    let previousHeight = 0;

    function checkUrlChange() {
        const currentUrl = window.location.href;
        const currentHeight = document.querySelector("#locationsTable").offsetHeight;

        if (currentUrl !== previousUrl || previousHeight !== currentHeight) {
            previousUrl = currentUrl;
            previousHeight = currentHeight
            mainScript();
        }
    }

    const observer = new MutationObserver(checkUrlChange);
    observer.observe(document, { childList: true, subtree: true });

    observeElement('#speciesTable tbody', () => {
        document.querySelectorAll('#speciesTable tbody tr').forEach(row => translateRow(row, translations));
    });

    observeElement('#movesTableTbody', () => {
        document.querySelectorAll('#movesTableTbody tr').forEach(row => translateMovesRow(row, translations));
    });

    const selectors = ['#speciesInput', '#movesInput', '#locationsInput'];
    const filterSelectors = ['#speciesFilterList .tableFilter', '#movesFilterList .tableFilter', '#locationsFilterList .tableFilter'];

    setTimeout(() => {
        const locationsBody = document.querySelector('#locationsTableTbody');
        observeElement('#locationsTableTbody', () => {
            const currentHeight = locationsBody.offsetHeight;
            if (previousHeight != currentHeight) {
                mainScript();
            }
        });

        mainScript();
        
        const searchInputs = selectors.map(selector => document.querySelector(selector));
        
        // IME 중복 입력 방지
        searchInputs.forEach(input => {
            input.addEventListener('blur', function(event) {
                const value = this.value
                this.value = '';
                this.value = value;
            });
        });

        // 검색창 한국어 -> 영어 변환
        searchInputs.forEach((input, index) => {
            const filterSelector = filterSelectors[index];
            input.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    const query = input.value.trim();
                    let value = translations.reverse[query] || 
                        Object.keys(translations.biomes).find(key => translations.biomes[key] === query) ||
                            Object.keys(translations.rarityHead).find(key => translations.rarityHead[key] === query) || 
                                reverseTranslatorMove(query);
                    if (value) {
                        setTimeout(() => {
                            input.value = value;
                        }, 0);
                    }
                    checkUrlChange();
                }
                setTimeout(() => { toggleFilter(input, filterSelector); }, 100);        
            });
        });
    }, 1000);

    // 일치하는 태그 토글
    function toggleFilter(input, selector) {
        const query = input.value.trim();
        const hasKr = /([\uAC00-\uD7A3]){2,}/.test(query);
        const filterListItems = document.querySelectorAll(selector);
        filterListItems.forEach(item => {
            if (query.length < 3 && !hasKr) {
                item.style.removeProperty('display');
                return
            }
            const span = Array.from(item.querySelectorAll('span')).find(span => 
                (span.getAttribute('data-original-text') && span.getAttribute('data-original-text').includes(query)) || 
                (span.innerText && span.innerText.includes(query))
            );
            if (span) {
                item.style = 'display: inline-block !important;';
            } else {
                item.style.removeProperty('display');
            }
        });
    }

    // 메인 스크립트
    function mainScript() {
        const currentUrl = window.location.href;

        addButtonsEventListener();

        if (currentUrl.includes('?table=speciesTable')) {
            toggleFilter(document.querySelector(selectors[0]), filterSelectors[0]);
            const variantNode = document.querySelector('#onlyShowVariantPokemon');
            if (variantNode) {
                variantNode.innerText = '변종';
            }
            translateHeader(document.querySelectorAll('#speciesTableThead th'), translations.headers);
            document.querySelectorAll('#speciesTable tbody tr').forEach(row => translateRow(row, translations));

            translateSpeciesFilterList(document.querySelectorAll('#speciesFilterList .tableFilter'));

        } else if (currentUrl.includes('?table=movesTable')) {
            toggleFilter(document.querySelector(selectors[1]), filterSelectors[1]);
            translateHeader(document.querySelectorAll('#movesTableThead th'), translations.moves_head);
            document.querySelectorAll('#movesTableTbody tr').forEach(row => translateMovesRow(row, translations));

            const popupObserver = new MutationObserver(() => translatePopup(translations));
            popupObserver.observe(document.getElementById('popup'), { childList: true, subtree: true });

            translateSpeciesFilterList(document.querySelectorAll('#movesFilterList .tableFilter'));

        } else if (currentUrl.includes('?species')) {
            speciesPage(translations);
            translateNodes(document.querySelectorAll('#speciesPanelBiomesContainer .speciesPanelText'), { "바이옴:": "바이옴:" });
            translateNodes(document.querySelectorAll('#speciesPanelBiomesContainer .hyperlink'), translations.biomes);

        } else if (currentUrl.includes('?table=locationsTable')) {
            toggleFilter(document.querySelector(selectors[2]), filterSelectors[2]);
            const variantNode = document.querySelector('#onlyShowVariantPokemonLocations');
            if (variantNode) {
                variantNode.innerText = '변종';
            }

            const timeData = { "Dawn": "아침", "Day": "낮", "Dusk": "저녁", "Night": "밤" };
            const nodesToTranslate = {
                '.locationSpeciesName': translations.names,
                '.rarityTableThead': translations.rarityHead,
                '.locationName': translations.biomes,
                '.timeOfDay': timeData
            };

            Object.keys(nodesToTranslate).forEach(selector => {
                const jsonData = nodesToTranslate[selector];
                translateNodes(document.querySelectorAll(selector), jsonData);
            });

            document.querySelectorAll('.previousLinkInfo, .nextLinkInfo').forEach(info => {
                const textNode = info.childNodes[0];
                if (translations.biomes[textNode.textContent]) {
                    textNode.textContent = translations.biomes[textNode.textContent];
                }
            });

            translateSpeciesFilterList(document.querySelectorAll('#locationsFilterList .tableFilter'));
        }
    }

    // 기술 페이지 역번역 함수
    function reverseTranslatorMove(query) {
        if (translations.move_reverse[query]) {
            return translations.move_reverse[query];
        }
        const filterTranslation = translations.move_filters.find(filter => filter[1] === query);
        if (filterTranslation) return filterTranslation[0];

        const move = Object.keys(translations.moves).find(key => translations.moves[key].name_kr === query);
        if (move) return move;

        const type = Object.keys(translations.types).find(key => translations.types[key] === query);
        if (type) return type;

        return false;
    }

    // 포켓몬 상세 페이지 번역
    function speciesPage(translations) {
        const translationMappings = [
            { selector: '#speciesName', key: 'names' },
            { selector: '#speciesType1', key: 'types' },
            { selector: '#speciesType2', key: 'types' },
            { selector: '#speciesType3', key: 'types' }
        ];
        
        translationMappings.forEach(mapping => {
            transElement(mapping.selector, mapping.key, mapping.text);
        });

        const panelText = {
            "Types:": "타입:",
            "Starter Cost:": "코스트:",
            "Abilities:": "특성:",
            "Biomes:": "바이옴:",
            "Evolution:": "진화:",
            "Formes:": "폼:"
        }

        const panels = document.querySelectorAll('.speciesPanelText');
        panels.forEach(panel => {
            if (panelText[panel.innerText]) {
                panel.innerText = panelText[panel.innerText];
            }
        })

        const abilities = document.querySelector('#speciesAbilities');
        if (abilities) {
            abilities.querySelectorAll('span.hyperlink').forEach(link => {
                if (translations.abilities[link.innerText]) {
                    link.innerText = translations.abilities[link.innerText];
                }
            });
        }

        const stats = document.querySelector('#statsSection');
        if (stats) {
            let replaceNames = { "Atk": "공격", "Def": "방어", "SpA": "특공", "SpD": "특방", "Spe": "속도", "BST": "합계" };
            Object.entries(replaceNames).forEach(([key, value]) => {
                stats.innerHTML = stats.innerHTML.replace(new RegExp(key, 'g'), value);
            });
        }

        const evoDiv = document.querySelector('#speciesEvoTable');
        function evoTrans(evoMethod) {
            const transData = [
                ['Level', '레벨'],
                ['Mega', '메가'],
                ['Giga', '거다이'],
                ['Item', '아이템']
            ]
            transData.forEach(([orig, trans]) => {
                evoMethod.innerText = evoMethod.innerText.replace(orig, trans);
            })
        }
        if (evoDiv) {
            const evoMethods = evoDiv.querySelectorAll('.evoMethod');
            evoMethods.forEach(evoMethod => {
                evoTrans(evoMethod);
            });
        }

        const formDiv = document.querySelector('#speciesFormes');
        if (formDiv) {
            formDiv.querySelectorAll('.underline').forEach(form => {
                if (translations.names[form.innerText]) {
                    form.innerText = translations.names[form.innerText];
                }
            });
        }

        const defensive = document.querySelector('#speciesDefensiveTypeChartContainer');
        if (defensive) {
            defensive.querySelector('.bold').innerText = "공격받을 때";
            defensive.querySelectorAll('.backgroundSmall').forEach(type => {
                const key = lowerText(type.className.split(' ')[1].replace('TYPE_', ''));
                if (translations.types[key]) {
                    type.innerText = translations.types[key];
                }
            });
        }

        const offensive = document.querySelector('#speciesOffensiveTypeChartContainer');
        if (offensive) {
            offensive.querySelector('.bold').innerText = "공격할 때";
            offensive.querySelectorAll('.backgroundSmall').forEach(type => {
                const key = lowerText(type.className.split(' ')[1].replace('TYPE_', ''));
                if (translations.types[key]) {
                    type.innerText = translations.types[key];
                }
            });
        }

        const moveTables = document.querySelectorAll('.speciesPanelLearnsetsTableMargin');
        const transTexts = { "Egg Moves": "유전 기술", "Level-Up": "레벨업", "TM/HM": "기술머신/비전머신" };
        moveTables.forEach(table => {
            let shift = 0;
            const ths = table.querySelectorAll('thead th');
            ths.forEach(th => {
                if (translations.moves_head[th.innerText]) {
                    th.innerText = translations.moves_head[th.innerText];
                } else if (th.innerText === 'Level' || th.innerText === '레벨') {
                    th.innerText = '레벨';
                    shift = 1;
                }
            });

            const caption = table.querySelector('caption.bold');
            const parts = caption.childNodes[0].textContent.split('\n');
            if (parts && transTexts[parts[0]]) {
                caption.childNodes[0].textContent = transTexts[parts[0]] + '\n' + parts[1];
            }

            table.querySelectorAll('tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                const nameCell = cells[0 + shift];
                if (nameCell) {
                    const effectCell = cells[6 + shift];
                    const move = translations.moves[Object.keys(translations.moves).find(key => translations.moves[key].name === nameCell.innerText)];
                    if (move) {
                        nameCell.innerText = move.name_kr;
                        if (move.Effect_kr) {
                            effectCell.innerHTML = move.Effect_kr.includes(". ") ? move.Effect_kr.replace(". ", ". \n").split("\n").map(part => `<div>${part}</div>`).join("") : splitMiddle(move.Effect_kr, 35).map(part => `<div>${part}</div>`).join("");
                        }
                    }

                    const typeDiv = cells[1 + shift].querySelector('div');
                    if (typeDiv) {
                        const key = lowerText(typeDiv.className.split(' ')[0].replace('TYPE_', ''));
                        if (translations.types[key]) {
                            typeDiv.innerText = translations.types[key];
                        }
                    }
                }
            });
        });
    }

    function splitMiddle(text, maxLength) {
        if (text.length <= maxLength) return [text];
        const middle = Math.floor(text.length / 2);
        let left = middle, right = middle;
        while (left > 0 && text[left] !== ' ') left--;
        while (right < text.length && text[right] !== ' ') right++;
        const splitIndex = (middle - left <= right - middle) ? left : right;
        return [text.substring(0, splitIndex), text.substring(splitIndex + 1)];
    }
})();
