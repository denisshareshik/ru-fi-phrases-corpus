// Глобальные переменные для данных
let allPhrases = [];
let filteredPhrases = [];
let currentSearchText = '';

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', function() {
    console.log("Загрузка данных...");
    loadData();
});

// Загрузка JSON данных
async function loadData() {
    try {
        console.log("Начинаем загрузку JSON файлов...");
        
        const [finnishResponse, russianResponse] = await Promise.all([
            fetch('./data/finnish_phrases.json'),
            fetch('./data/russian_phrases.json')
        ]);
        
        if (!finnishResponse.ok) throw new Error(`Ошибка загрузки финских данных: ${finnishResponse.status}`);
        if (!russianResponse.ok) throw new Error(`Ошибка загрузки русских данных: ${russianResponse.status}`);
        
        const finnishData = await finnishResponse.json();
        const russianData = await russianResponse.json();
        
        console.log("Данные загружены:", {
            finnish: finnishData.length,
            russian: russianData.length
        });

        // Объединяем данные с пометкой языка
        allPhrases = [
            ...finnishData.map(phrase => ({ 
                ...phrase, 
                language: 'fi', 
                languageName: 'Финский',
                displayPhrase: phrase.phrase_fi,
                displayTranslation: phrase.literal_translation_ru
            })),
            ...russianData.map(phrase => ({ 
                ...phrase, 
                language: 'ru', 
                languageName: 'Русский',
                displayPhrase: phrase.phrase_ru,
                displayTranslation: phrase.literal_translation_fi
            }))
        ];
        
        console.log("Всего фраз:", allPhrases.length);
        
        // Первоначальная загрузка всех данных
        filteredPhrases = allPhrases;
        displayPhrases('');
        
        // Добавляем обработчики событий после загрузки данных
        initEventListeners();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        document.getElementById('phrasesList').innerHTML = 
            `<div class="error">Ошибка загрузки данных: ${error.message}</div>`;
    }
}

// Инициализация обработчиков событий
function initEventListeners() {
    document.getElementById('languageFilter').addEventListener('change', searchPhrases);
    document.getElementById('semanticFilter').addEventListener('change', searchPhrases);
    document.getElementById('styleFilter').addEventListener('change', searchPhrases);
    document.getElementById('originFilter').addEventListener('change', searchPhrases);
    document.getElementById('orFilter').addEventListener('change', searchPhrases);

    document.getElementById('searchInput').addEventListener('input', searchPhrases);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPhrases();
        }
    });
    
    console.log("Обработчики событий инициализированы");
}

// Функция для подсветки текста
function highlightText(text, searchTerm) {
    if (!searchTerm || !text) return escapeHtml(text);
    
    const escapedSearchTerm = escapeRegExp(searchTerm);
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Экранирование специальных символов для регулярных выражений
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Поиск фраз
function searchPhrases() {
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
    const languageFilter = document.getElementById('languageFilter').value;
    const semanticFilter = document.getElementById('semanticFilter').value;
    const styleFilter = document.getElementById('styleFilter').value;
    const originFilter = document.getElementById('originFilter').value;
    const orFilter = document.getElementById('orFilter').value;
    
    console.log("Поиск:", { searchText, languageFilter, semanticFilter, styleFilter });
    currentSearchText = searchText;
    
    filteredPhrases = allPhrases.filter(phrase => {
        // Поиск по тексту
        let matchesSearch = true;
        if (searchText) {
            matchesSearch = (
                (phrase.displayPhrase && phrase.displayPhrase.toLowerCase().includes(searchText)) ||
                (phrase.displayTranslation && phrase.displayTranslation.toLowerCase().includes(searchText)) ||
                (phrase.commentary && phrase.commentary.toLowerCase().includes(searchText)) ||
                (phrase.semantic_label && phrase.semantic_label.toLowerCase().includes(searchText)) ||
                (phrase.stylistic_label && phrase.stylistic_label.toLowerCase().includes(searchText)) ||
                (phrase.origin_label && phrase.origin_label.toLowerCase().includes(searchText))||
                (phrase.or_label && phrase.or_label.toLowerCase().includes(searchText))
            );
        }
        
        // Фильтр по языку
        const matchesLanguage = languageFilter === 'all' || phrase.language === languageFilter;
        
        // Фильтр по семантике
        const matchesSemantic = semanticFilter === 'all' || 
            (phrase.semantic_label && phrase.semantic_label.includes(semanticFilter));
        
        // Фильтр по стилю
        const matchesStyle = styleFilter === 'all' || 
            (phrase.stylistic_label && phrase.stylistic_label.includes(styleFilter));

        // Фильтр по происхождению
        const matchesOrigin = originFilter === 'all' || 
            (phrase.origin_label && phrase.origin_label.includes(originFilter));

        // Фильтр по исконности
        const matchesOr = orFilter === 'all' || 
            (phrase.or_label && phrase.or_label.includes(orFilter));
        
        return matchesSearch && matchesLanguage && matchesSemantic && matchesStyle && matchesOrigin && matchesOr;
    });
    
    console.log("Найдено результатов:", filteredPhrases.length);
    displayPhrases(searchText);
}

// Отображение результатов
function displayPhrases(searchText) {
    const phrasesList = document.getElementById('phrasesList');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = `Найдено фраз: ${filteredPhrases.length}`;
    
    if (filteredPhrases.length === 0) {
        phrasesList.innerHTML = '<div class="no-results">По вашему запросу ничего не найдено</div>';
        return;
    }
    
    phrasesList.innerHTML = filteredPhrases.map(phrase => {
        const highlightedPhrase = highlightText(phrase.displayPhrase, searchText);
        const highlightedTranslation = highlightText(phrase.displayTranslation, searchText);
        const highlightedCommentary = highlightText(phrase.commentary, searchText);
        const highlightedSemantic = highlightText(phrase.semantic_label, searchText);
        const highlightedStyle = highlightText(phrase.stylistic_label, searchText);
        const highlightedOrigin = highlightText(phrase.origin_label, searchText);
        
        return `
            <div class="phrase-card">
                <div class="phrase-header">
                    <div class="phrase-text">${highlightedPhrase}</div>
                    <span class="language-tag language-${phrase.language}">
                        ${phrase.languageName}
                    </span>
                </div>
                
                <div class="phrase-translation">
                    <strong>Буквальный перевод:</strong> ${highlightedTranslation}
                </div>
                
                <div class="phrase-details">
                    <div class="detail-item">
                        <span class="detail-label">Семантика:</span>
                        ${highlightedSemantic || '—'}
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Стилистика:</span>
                        ${highlightedStyle || '—'}
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Происхождение:</span>
                        ${highlightedOrigin || '—'}
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">Исконное/неисконное:</span>
                        ${escapeHtml(phrase.or_label || '—')}
                    </div>
                </div>
                
                ${phrase.commentary ? `
                    <div class="commentary">
                        <strong>Комментарий:</strong> ${highlightedCommentary}
                    </div>
                ` : ''}
                
                ${phrase.or_label ? `
                    <div class="origin-label">
                        <strong>Происхождение:</strong> 
                        <span class="origin-${phrase.or_label === 'исконное' ? 'native' : 'borrowed'}">
                            ${phrase.or_label & phrase.origin_label}
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Функция для экранирования HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}