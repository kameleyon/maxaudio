from TTS.api import TTS
import os

def test_tts():
    try:
        # Initialize TTS with FastPitch model
        tts = TTS("tts_models/en/ljspeech/fast_pitch")
        
        # Create test output directory if it doesn't exist
        os.makedirs("server/test-output", exist_ok=True)
        
        # Generate test audio
        output_path = "server/test-output/test.wav"
        tts.tts_to_file(text="This is a test of the FastPitch text to speech system.", file_path=output_path)
        
        if os.path.exists(output_path):
            print(f"Test successful! Audio file created at: {output_path}")
        else:
            print("Test failed: Audio file was not created")
    except Exception as e:
        print(f"Error during TTS test: {str(e)}")

if __name__ == "__main__":
    test_tts()
