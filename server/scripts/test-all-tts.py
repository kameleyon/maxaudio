from TTS.api import TTS
import os
import time

def test_tts_models():
    # Create output directory
    os.makedirs("server/test-output", exist_ok=True)
    
    try:
        # Test FastPitch
        print("\nTesting FastPitch model...")
        fastpitch = TTS("tts_models/en/ljspeech/fast_pitch")
        output_path = "server/test-output/fastpitch_test.wav"
        start_time = time.time()
        fastpitch.tts_to_file(text="This is a test of the FastPitch text to speech system.", file_path=output_path)
        end_time = time.time()
        if os.path.exists(output_path):
            print(f"✓ FastPitch test successful! Audio file created at: {output_path}")
            print(f"  Processing time: {end_time - start_time:.2f} seconds")
        
        # Test YourTTS
        print("\nTesting YourTTS model...")
        yourtts = TTS("tts_models/multilingual/multi-dataset/your_tts")
        output_path = "server/test-output/yourtts_test.wav"
        start_time = time.time()
        yourtts.tts_to_file(text="This is a test of the YourTTS multilingual system.", file_path=output_path)
        end_time = time.time()
        if os.path.exists(output_path):
            print(f"✓ YourTTS test successful! Audio file created at: {output_path}")
            print(f"  Processing time: {end_time - start_time:.2f} seconds")
        
        print("\nAll TTS models tested successfully!")
        
    except Exception as e:
        print(f"\nError during TTS test: {str(e)}")

if __name__ == "__main__":
    test_tts_models()
