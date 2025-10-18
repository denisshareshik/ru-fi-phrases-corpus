import mysql.connector
import json
import os

def convert_mysql_to_json():
    # Настройки подключения к MySQL
    config = {
        'user': 'root',
        'password': 'root',
        'host': 'localhost',
        'database': 'death_phrases_corpus',
        'charset': 'utf8'
    }
    
    try:
        # Подключение к базе данных
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor(dictionary=True)
        
        # Создаем папку data если ее нет
        if not os.path.exists('data'):
            os.makedirs('data')
        
        # Конвертируем финские фразеологизмы
        cursor.execute("SELECT * FROM finnish_death_phrases")
        finnish_phrases = []
        
        for row in cursor.fetchall():
            # Приводим данные к правильному формату
            phrase = {
                'id': row['id'],
                'phrase_fi': row['phrase_fi'].capitalize() or '',
                'literal_translation_ru': row['literal_translation_ru'].capitalize() or '',
                'meaning_fi': row['meaning_fi'] or 'Kuolla'.capitalize(),
                'meaning_ru': row['meaning_ru'] or 'Умереть'.capitalize(),
                'semantic_label': row['semantic_label'] or '',
                'stylistic_label': row['stylistic_label'] or '',
                'origin_label': row['origin_label'] or '',
                'or_label': row['or_label'] or '',
                'context_fi': row['context_fi'] or '',
                'context_ru': row['context_ru'] or '',
                'commentary': row['commentary'] or ''
            }
            finnish_phrases.append(phrase)
        
        # Конвертируем русские фразеологизмы
        cursor.execute("SELECT * FROM russian_death_phrases")
        russian_phrases = []
        
        for row in cursor.fetchall():
            phrase = {
                'id': row['id'],
                'phrase_ru': row['phrase_ru'].capitalize() or '',
                'literal_translation_fi': row['literal_translation_fi'].capitalize() or '',
                'meaning_ru': row['meaning_ru'] or 'Умереть'.capitalize(),
                'meaning_fi': row['meaning_fi'] or 'Kuolla'.capitalize(),
                'semantic_label': row['semantic_label'] or '',
                'stylistic_label': row['stylistic_label'] or '',
                'origin_label': row['origin_label'] or '',
                'or_label': row['or_label'].capitalize() or '',
                'context_ru': row['context_ru'] or '',
                'context_fi': row['context_fi'] or '',
                'commentary': row['commentary'] or ''
            }
            russian_phrases.append(phrase)
        # Сохраняем в JSON с правильной кодировкой
        with open('data/finnish_phrases.json', 'w', encoding='utf-8') as f:
            json.dump(finnish_phrases, f, ensure_ascii=False, indent=2)
        
        with open('data/russian_phrases.json', 'w', encoding='utf-8') as f:
            json.dump(russian_phrases, f, ensure_ascii=False, indent=2)
        
        print(f"Успешно конвертировано:")
        print(f"- Финских фраз: {len(finnish_phrases)}")
        print(f"- Русских фраз: {len(russian_phrases)}")
        print("Файлы сохранены в папке data/")
        
    except mysql.connector.Error as e:
        print(f"Ошибка подключения к MySQL: {e}")
    except Exception as e:
        print(f"Ошибка: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    convert_mysql_to_json()