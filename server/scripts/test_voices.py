import os
import sys
from pathlib import Path
from TTS.api import TTS

def test_xtts_voice(text, output_dir, speaker_wav, language="en", accent="en"):
    """Test XTTS v2 model with specific speaker reference"""
    try:
        # Initialize TTS with XTTS v2
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        tts = TTS(model_name=model_name, progress_bar=True)
        
        # Create output filename
        speaker_type = "female" if "female" in speaker_wav else "male"
        output_file = os.path.join(output_dir, f"test_xtts_{speaker_type}_{accent}.wav")
        
        print(f"\nTesting XTTS v2 with {speaker_type} voice ({accent} accent)")
        print(f"Output file: {output_file}")
        print(f"Using speaker reference: {speaker_wav}")
        
        # Generate speech with specified language and accent
        tts.tts_to_file(
            text=text,
            file_path=output_file,
            speaker_wav=speaker_wav,
            language=language
        )
            
        print(f"Successfully generated audio with XTTS v2 {speaker_type} voice")
        return True
        
    except Exception as e:
        print(f"Error testing XTTS v2 {speaker_type} voice: {str(e)}")
        return False

def main():
    # Create test output directory
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Test text with various speech patterns
    test_text = """Hello! Let me demonstrate the voice capabilities.
    
    (happy)I'm really excited to show you this!) 
    
    (thoughtful)Now, let me think about something important...)
    
    (soft)This is how I speak softly and calmly.)
    
    *This part is emphasized*, and **this part is strongly emphasized**.
    
    (excited)Wow! This is amazing!) ... (calm)But let's stay focused.)"""
    
    # Test both female and male voices with US and UK accents
    tests = [
        {
            'speaker_wav': 'models/speaker_references/female.wav',
            'language': 'en',
            'accent': 'us'
        },
        {
            'speaker_wav': 'models/speaker_references/male.wav',
            'language': 'en',
            'accent': 'us'
        },
        {
            'speaker_wav': 'models/speaker_references/female.wav',
            'language': 'en',
            'accent': 'gb'
        },
        {
            'speaker_wav': 'models/speaker_references/male.wav',
            'language': 'en',
            'accent': 'gb'
        }
    ]
    
    print("Starting voice tests...")
    
    for test in tests:
        success = test_xtts_voice(
            test_text,
            output_dir,
            test['speaker_wav'],
            test['language'],
            test['accent']
        )
        if success:
            print(f"✓ Test successful for {test['accent'].upper()} {os.path.basename(test['speaker_wav']).split('.')[0]} voice")
        else:
            print(f"✗ Test failed for {test['accent'].upper()} {os.path.basename(test['speaker_wav']).split('.')[0]} voice")
    
    print("\nVoice testing completed")
    print(f"Test files are available in: {output_dir.absolute()}")

if __name__ == "__main__":
    main()
