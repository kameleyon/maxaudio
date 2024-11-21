import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { voiceCloneService, type VoiceTrainingData, type CustomVoiceModel } from '../../services/voice-cloning.service';

interface AudioData {
  audioContent: Buffer;
  transcription: string;
  speakerName: string;
  languageCode: string;
}

interface ProcessedTrainingData {
  audioFile: File;
  name: string;
  description: string;
}

export const VoiceCloning: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<CustomVoiceModel[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const processedData: ProcessedTrainingData[] = acceptedFiles.map(file => ({
        audioFile: file,
        name: file.name.split('.')[0],
        description: `Voice model trained from ${file.name}`
      }));

      const results = await Promise.all(
        processedData.map(data => voiceCloneService.trainCustomVoice(data))
      );

      setModels(prevModels => [...prevModels, ...results]);
    } catch (err) {
      setError('Failed to process audio files. Please try again.');
      console.error('Error processing audio files:', err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3']
    },
    multiple: true
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelList = await voiceCloneService.listCustomVoiceModels();
        setModels(modelList);
      } catch (err) {
        setError('Failed to load voice models');
        console.error('Error loading voice models:', err);
      }
    };

    loadModels();
  }, []);

  const handleDeleteModel = async (modelId: string) => {
    try {
      await voiceCloneService.deleteCustomVoiceModel(modelId);
      setModels(prevModels => prevModels.filter(model => model.id !== modelId));
    } catch (err) {
      setError('Failed to delete voice model');
      console.error('Error deleting voice model:', err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Voice Cloning
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          mb: 3,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main'
          }
        }}
      >
        <input {...getInputProps()} />
        {loading ? (
          <CircularProgress />
        ) : isDragActive ? (
          <Typography>Drop the audio files here...</Typography>
        ) : (
          <Typography>
            Drag and drop audio files here, or click to select files
          </Typography>
        )}
      </Box>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <Typography variant="h5" gutterBottom>
        Your Voice Models
      </Typography>

      {models.map(model => (
        <Box
          key={model.id}
          sx={{
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            mb: 2
          }}
        >
          <Typography variant="h6">{model.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {model.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created: {new Date(model.createdAt).toLocaleDateString()}
          </Typography>
          {model.description && (
            <Typography variant="body2" color="text.secondary">
              {model.description}
            </Typography>
          )}
          <Box mt={1}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDeleteModel(model.id)}
            >
              Delete Model
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
