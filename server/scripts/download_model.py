from TTS.utils.manage import ModelManager
import sys

def download_model(output_path):
    manager = ModelManager()
    model_name = "tts_models/multilingual/multi-dataset/your_tts"
    # Fix the syntax by adding a comma between arguments
    manager.download_model(model_name, output_path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python download_model.py <output_path>")
        sys.exit(1)
    download_model(sys.argv[1])