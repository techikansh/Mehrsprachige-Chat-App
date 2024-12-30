import time
import json
import deepl
import csv
import os
from typing import Optional, Dict
from dotenv import load_dotenv
import google.generativeai as genai
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.translate.meteor_score import meteor_score
from nltk.tokenize import word_tokenize
import nltk
import asyncio
from groq import Groq

# Download required NLTK data
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')

load_dotenv()
smoothie = SmoothingFunction()
BATCH_SIZE = 25 
BATCH_DELAY = 61

async def translate_with_deepl(text: str, target_lang: str, deepl_api_key: str, max_retries: int = 3) -> Optional[Dict]:
    retry_count = 0
    delay = 2
    
    while retry_count < max_retries:
        try:
            translator = deepl.Translator(deepl_api_key)
            if target_lang == 'EN':
                target_lang = 'EN-GB'
            
            start_time = time.time()
            result = translator.translate_text(text, target_lang=target_lang)
            end_time = time.time()
            
            return {
                'translated_text': result.text,
                'time_taken': end_time - start_time
            }
            
        except deepl.exceptions.QuotaExceededException:
            return None
        except deepl.exceptions.TooManyRequestsException:
            await asyncio.sleep(delay * (2 ** retry_count))
            retry_count += 1
        except Exception as e:
            print(f"DeepL Translation Error: {str(e)}")
            await asyncio.sleep(delay)
            retry_count += 1
    
    print("deepl did not return a translation")
    return None

async def translate_with_gemini(text: str, target_lang: str, gemini_api_key: str, max_retries: int = 3) -> Optional[Dict]:
    retry_count = 0
    delay = 2
    
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    while retry_count < max_retries:
        try:
            start_time = time.time()
            prompt = f"Your a translator.Translate the following text to {target_lang}: '{text}'. Only return the translation, nothing else."
            result = model.generate_content(prompt)
            end_time = time.time()
            
            if result.text:
                return {
                    'translated_text': result.text.strip(),
                    'time_taken': end_time - start_time
                }
                
        except Exception as e:
            print(f"Gemini Translation Error: {str(e)}")
            await asyncio.sleep(delay * (2 ** retry_count))
            retry_count += 1
    
    print("gemini did not return a translation")
    return None

async def translate_with_groq(text: str, target_lang: str, groq_api_key: str, max_retries: int = 3) -> Optional[Dict]:
    retry_count = 0
    delay = 2
    
    client = Groq(api_key=groq_api_key)
    
    while retry_count < max_retries:
        try:
            start_time = time.time()
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a translator. Translate to {target_lang}. Only return the translation, nothing else."
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                # model="llama-3.2-3b-preview",
                # model="llama-3.1-8b-instant",
                model="llama-3.3-70b-versatile",
                temperature=0.2,
                max_tokens=1024
            )
            end_time = time.time()
            
            return {
                'translated_text': chat_completion.choices[0].message.content.strip(),
                'time_taken': end_time - start_time
            }
            
        except Exception as e:
            print(f"Groq Translation Error: {str(e)}")
            await asyncio.sleep(delay * (2 ** retry_count))
            retry_count += 1
            
    print("groq did not return a translation")
    return None

def evaluate_translation(reference_text, translated_text, source_text, translation_time):
    
    if not translated_text:  
        return {
            'source_text': source_text,
            'translated_text': '',
            'reference_text': reference_text,
            'bleu_score': 0.0,
            'meteor_score': 0.0,
            'time_taken': translation_time
        }
        
    reference_tokens = word_tokenize(reference_text)
    candidate_tokens = word_tokenize(translated_text)
    
    bleu_score = sentence_bleu([reference_tokens], candidate_tokens, smoothing_function=smoothie.method1)
    meteor_result = meteor_score([reference_tokens], candidate_tokens, gamma=0)
    
    return {
        'source_text': source_text,
        'translated_text': translated_text,
        'reference_text': reference_text,
        'bleu_score': bleu_score,
        'meteor_score': meteor_result,
        'time_taken': translation_time
    }

async def run_evaluation(test_data, deepl_api_key, gemini_api_key, groq_api_key):
    results = []
    total_items = len(test_data)
    
    # Process data in batches
    for batch_start in range(0, total_items, BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, total_items)
        current_batch = test_data[batch_start:batch_end]
        
        print(f"\nProcessing batch {batch_start//BATCH_SIZE + 1} of {(total_items + BATCH_SIZE - 1)//BATCH_SIZE}")
        
        # Process each item in the current batch
        for item in current_batch:
            # Get translations from all services
            deepl_result = await translate_with_deepl(
                item['text'],
                item['target_language'],
                deepl_api_key
            )
            
            gemini_result = await translate_with_gemini(
                item['text'],
                item['target_language'],
                gemini_api_key
            )
            
            groq_result = await translate_with_groq(
                item['text'],
                item['target_language'],
                groq_api_key
            )
            
            # Evaluate and store results for each service
            if deepl_result:
                deepl_eval = evaluate_translation(
                    item['reference'],
                    deepl_result['translated_text'],
                    item['text'],
                    deepl_result['time_taken']
                )
                deepl_eval['service'] = 'deepl'
                results.append(deepl_eval)
                
            if gemini_result:
                gemini_eval = evaluate_translation(
                    item['reference'],
                    gemini_result['translated_text'],
                    item['text'],
                    gemini_result['time_taken']
                )
                gemini_eval['service'] = 'gemini'
                results.append(gemini_eval)
                
            if groq_result:
                groq_eval = evaluate_translation(
                    item['reference'],
                    groq_result['translated_text'],
                    item['text'],
                    groq_result['time_taken']
                )
                groq_eval['service'] = 'groq'
                results.append(groq_eval)
        
        # Add delay between batches (except for the last batch)
        if batch_end < total_items:
            print(f"Waiting {BATCH_DELAY} seconds before next batch...")
            await asyncio.sleep(BATCH_DELAY)
    
    return results


def save_results(results, output_file='translation_results.csv'):
    if not results:
        return
    
    fieldnames = ['service', 'source_text', 'translated_text', 'reference_text',
                 'bleu_score', 'meteor_score', 'time_taken']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

def calculate_averages(results):
    service_metrics = {}
    for service in ['deepl', 'gemini', 'groq']:
        service_results = [r for r in results if r['service'] == service]
        if service_results:
            service_metrics[service] = {
                'avg_bleu': sum(r['bleu_score'] for r in service_results) / len(service_results),
                'avg_meteor': sum(r['meteor_score'] for r in service_results) / len(service_results),
                'avg_time': sum(r['time_taken'] for r in service_results) / len(service_results)
            }
    return service_metrics

async def main():
    
    deepl_api_key = os.getenv('DEEPL_API_KEY')
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    groq_api_key = os.getenv('GROQ_API_KEY')
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(script_dir, 'datasets')
    
    with open(os.path.join(dataset_dir, 'dataset_spanish_english.json'), 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    
    results = await run_evaluation(test_data, deepl_api_key, gemini_api_key, groq_api_key)
    save_results(results)
    
    averages = calculate_averages(results)
    print("\nEvaluation Results:")
    for service, metrics in averages.items():
        print(f"\n{service.upper()} Metrics:")
        print(f"Average BLEU Score: {metrics['avg_bleu']:.4f}")
        print(f"Average METEOR Score: {metrics['avg_meteor']:.4f}")
        print(f"Average Translation Time: {metrics['avg_time']:.4f} seconds")
    
    

if __name__ == "__main__":
    asyncio.run(main())
