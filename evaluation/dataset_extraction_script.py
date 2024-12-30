import json
import random
import os

def create_translation_dataset(source_file, target_file, num_pairs=200):
    """
    Create a dataset of 100 source to target translation pairs from parallel corpus files.
    
    Args:
        source_file (str): Path to the source file
        target_file (str): Path to the target file
        num_pairs (int): Number of translation pairs to include (default: 200)
    """
    dataset = []
    
    # Read both files
    with open(source_file, 'r', encoding='utf-8') as source, \
         open(target_file, 'r', encoding='utf-8') as target:
        
        # Process only the desired number of pairs
        count = 0
        for source_line, target_line in zip(source, target):
            if count >= num_pairs:
                break
                
            # Only include non-empty lines
            source_text = source_line.strip()
            target_text = target_line.strip()
            
            if source_text and target_text:
                translation_pair = {
                    'id': count+1,
                    'text': source_text,
                    'target_language': 'ES',
                    'reference': target_text
                }
                dataset.append(translation_pair)
                count += 1
    
    # Save to JSON file
    output_file = os.path.join(dataset_dir, 'dataset_english_spanish.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=4)
    print(f"Created dataset with {len(dataset)} source to target translation pairs")
    return dataset

# Example usage:
if __name__ == "__main__":
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(script_dir, 'datasets')
    corpus_dir = os.path.join(dataset_dir, 'parallel_corpus')
    
    german_file = os.path.join(corpus_dir, 'German-de-en.txt')  # German <-> English source file
    english_german_file = os.path.join(corpus_dir, 'English-de-en.txt')  # German <-> English target file
    
    spanish_file = os.path.join(corpus_dir, 'europarl-v7.es-en.es')  # Spanish <-> English source file
    english_spanish_file = os.path.join(corpus_dir, 'europarl-v7.es-en.en')  # Spanish <-> English target file
    
    # Create dataset
    dataset = create_translation_dataset(
        source_file=english_spanish_file,
        target_file=spanish_file
    )
    
    # Print first few examples
    print("\nFirst 3 examples from the dataset:")
    for example in dataset[:3]:
        print(json.dumps(example, indent=2, ensure_ascii=False))