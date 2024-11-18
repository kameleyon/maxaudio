import os
import sys
from TTS.utils.manage import ModelManager
from TTS.utils.synthesizer import Synthesizer
from TTS.utils.audio import AudioProcessor

def download_model(model_name):
    """Download a specific TTS model"""
    print(f"Downloading model: {model_name}")
    model_path = os.path.join("models", model_name)
    
    # Create models directory if it doesn't exist
    os.makedirs("models", exist_ok=True)
    
    # Initialize model manager
    manager = ModelManager()
    
    try:
        # Download the model
        model_path, config_path, model_item = manager.download_model(model_name)
        print(f"Successfully downloaded {model_name}")
        return model_path, config_path
    except Exception as e:
        print(f"Error downloading {model_name}: {str(e)}")
        return None, None

def main():
    # List of high-quality models we want to download
    models = [
        "tts_models/multilingual/multi-dataset/xtts_v2",
        "tts_models/en/vctk/vits",
        "tts_models/en/ljspeech/vits",
        "vocoder_models/en/ljspeech/hifigan_v2"
    ]
    
    print("Starting model downloads...")
    
    for model in models:
        model_path, config_path = download_model(model)
        if model_path:
            print(f"Model {model} downloaded to {model_path}")
            print(f"Config saved to {config_path}")
        else:
            print(f"Failed to download {model}")
    
    print("Model download process completed")

if __name__ == "__main__":
    main()
