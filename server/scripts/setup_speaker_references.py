"""
Script to set up speaker reference audio files for XTTS v2 voice synthesis.
This script generates high-quality reference audio files for both male and female voices.
"""

import os
import sys
from pathlib import Path
from TTS.api import TTS
import soundfile as sf
import numpy as np
import torch
import torchaudio
import torchaudio.transforms as T

class SpeakerReferenceGenerator:
    def __init__(self):
        self.ref_dir = Path("models/speaker_references")
        self.temp_dir = Path("models/temp")
        self.sample_rate = 22050  # Standard sample rate for TTS
        
        # Ensure directories exist
        self.ref_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def preprocess_audio(self, audio_data, sample_rate):
        """Preprocess audio data to match XTTS requirements"""
        # Convert to torch tensor if needed
        if isinstance(audio_data, np.ndarray):
            audio_tensor = torch.from_numpy(audio_data)
        else:
            audio_tensor = audio_data

        # Ensure audio is mono
        if len(audio_tensor.shape) > 1 and audio_tensor.shape[0] > 1:
            audio_tensor = torch.mean(audio_tensor, dim=0)

        # Resample if necessary
        if sample_rate != self.sample_rate:
            resampler = T.Resample(sample_rate, self.sample_rate)
            audio_tensor = resampler(audio_tensor)

        # Normalize audio
        audio_tensor = audio_tensor / torch.max(torch.abs(audio_tensor))

        return audio_tensor

    def enhance_audio_quality(self, audio_tensor):
        """Enhance audio quality using basic audio processing"""
        # Convert to frequency domain using torchaudio
        specgram = T.Spectrogram(
            n_fft=2048,
            win_length=2048,
            hop_length=512,
            power=None
        )(audio_tensor)
        
        # Create frequency boost filter (enhance high frequencies for clarity)
        freqs = torch.linspace(0, self.sample_rate/2, specgram.shape[0])
        boost_filter = 1.0 + 0.2 * (freqs / (self.sample_rate/4))  # Gentle high-frequency boost
        boost_filter = boost_filter.view(-1, 1)
        
        # Apply filter
        specgram = specgram * boost_filter
        
        # Convert back to time domain
        inverse_transform = T.InverseSpectrogram(
            n_fft=2048,
            win_length=2048,
            hop_length=512
        )
        audio_tensor = inverse_transform(specgram)
        
        return audio_tensor

    def deepen_male_voice(self, audio_tensor):
        """Apply multiple techniques to create a deeper male voice"""
        # 1. Pitch shifting through resampling
        temp_sr = int(self.sample_rate * 0.8)  # Lower pitch by 20%
        resampler_down = T.Resample(self.sample_rate, temp_sr)
        resampler_up = T.Resample(temp_sr, self.sample_rate)
        audio_tensor = resampler_up(resampler_down(audio_tensor))
        
        # 2. Enhance lower frequencies using torchaudio
        specgram = T.Spectrogram(
            n_fft=2048,
            win_length=2048,
            hop_length=512,
            power=None
        )(audio_tensor)
        
        # Create bass boost filter
        freqs = torch.linspace(0, self.sample_rate/2, specgram.shape[0])
        bass_boost = 1.5 / (1.0 + (freqs / 150) ** 2)  # Strong boost below 150 Hz
        bass_boost = bass_boost.view(-1, 1)
        
        # Apply filter
        specgram = specgram * bass_boost
        
        # Convert back to time domain
        inverse_transform = T.InverseSpectrogram(
            n_fft=2048,
            win_length=2048,
            hop_length=512
        )
        audio_tensor = inverse_transform(specgram)
        
        return audio_tensor

    def generate_reference_audio(self, voice_type):
        """Generate a reference audio file using appropriate TTS model"""
        output_path = self.ref_dir / f"{voice_type}.wav"
        temp_path = self.temp_dir / f"{voice_type}_temp.wav"

        print(f"\nGenerating {voice_type} reference audio...")

        try:
            # Select appropriate model and text for each voice type
            if voice_type == "female":
                model_name = "tts_models/en/ljspeech/tacotron2-DDC"
                text = ("Hello, I am a female voice assistant. "
                       "I aim to provide clear and natural speech with proper intonation and emphasis. "
                       "My voice is designed to be pleasant and professional.")
            else:
                # Use FastPitch model for male voice
                model_name = "tts_models/en/ljspeech/fast_pitch"
                text = ("Hello, I am a male voice assistant. "
                       "I aim to provide clear and natural speech with proper intonation and emphasis. "
                       "My voice is designed to be deep and professional.")

            # Initialize TTS model
            print(f"Loading model: {model_name}")
            tts = TTS(model_name=model_name)

            # Generate initial audio
            print("Generating initial audio...")
            tts.tts_to_file(text=text, file_path=str(temp_path))

            # Read generated audio
            print("Processing audio...")
            audio_data, sample_rate = sf.read(temp_path)

            # Convert to torch tensor
            audio_tensor = torch.from_numpy(audio_data).to(torch.float32)

            # Apply voice-specific processing
            if voice_type == "male":
                print("Applying male voice enhancements...")
                audio_tensor = self.deepen_male_voice(audio_tensor)
            
            # Enhance audio quality for both voices
            print("Enhancing audio quality...")
            audio_tensor = self.enhance_audio_quality(audio_tensor)

            # Normalize
            audio_tensor = audio_tensor / torch.max(torch.abs(audio_tensor))

            # Convert back to numpy array
            processed_audio = audio_tensor.numpy()

            # Save final audio with specific format for XTTS
            print("Saving processed audio...")
            sf.write(
                output_path,
                processed_audio,
                self.sample_rate,
                format='WAV',
                subtype='FLOAT'
            )

            # Verify the generated file
            print("Verifying generated audio...")
            verification_data, _ = sf.read(output_path)
            if np.max(np.abs(verification_data)) <= 0:
                raise ValueError("Generated audio file appears to be silent")

            print(f"✓ Successfully generated {voice_type} reference audio")
            return True

        except Exception as e:
            print(f"✗ Error generating {voice_type} reference: {str(e)}")
            if output_path.exists():
                output_path.unlink()
            return False

        finally:
            # Clean up temporary files
            if temp_path.exists():
                temp_path.unlink()

    def cleanup(self):
        """Clean up temporary directory"""
        try:
            if self.temp_dir.exists():
                import shutil
                shutil.rmtree(self.temp_dir)
        except Exception as e:
            print(f"Error cleaning up temporary directory: {str(e)}")

def main():
    """Main function to set up speaker references"""
    generator = SpeakerReferenceGenerator()
    
    print("Starting speaker reference setup...")
    print(f"Reference directory: {generator.ref_dir.absolute()}")
    
    success = True
    for voice_type in ["female", "male"]:
        if not generator.generate_reference_audio(voice_type):
            success = False
    
    generator.cleanup()
    
    if success:
        print("\n✓ Speaker reference setup completed successfully")
        print(f"Reference files are available in: {generator.ref_dir.absolute()}")
    else:
        print("\n✗ Speaker reference setup completed with errors")
        sys.exit(1)

if __name__ == "__main__":
    main()
