"""
Simple test script for TTS functionality
"""

from TTS.api import TTS
import os
from pathlib import Path

def main():
    # Create output directory
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Test text
    text = "Hello, this is a test of the text to speech system."
    
    try:
        print("Initializing TTS with XTTS v2...")
        tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
        
        # Get speaker reference path
        speaker_wav = Path("models/speaker_references/female.wav")
        if not speaker_wav.exists():
            print(f"Error: Speaker reference file not found at {speaker_wav}")
            return
            
        output_path = output_dir / "test_simple.wav"
        print(f"\nGenerating speech...")
        print(f"Text: {text}")
        print(f"Output: {output_path}")
        print(f"Speaker reference: {speaker_wav}")
        
        # Generate speech
        tts.tts_to_file(
            text=text,
            file_path=str(output_path),
            speaker_wav=str(speaker_wav),
            language="en"
        )
        
        # Verify output
        if output_path.exists():
            print(f"\n✓ Successfully generated audio file: {output_path}")
            print(f"File size: {output_path.stat().st_size} bytes")
        else:
            print(f"\n✗ Failed to generate audio file")
            
    except Exception as e:
        print(f"\n✗ Error during TTS generation: {str(e)}")

if __name__ == "__main__":
    main()
