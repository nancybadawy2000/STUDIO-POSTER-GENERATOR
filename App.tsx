
import React, { useState, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { TextInput } from './components/TextInput';
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';
import { generateA0PosterSeries } from './services/geminiService';
import { downloadBase64Image } from './utils/fileUtils';
import type { UploadedImage } from './types';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { StyleIcon } from './components/icons/StyleIcon';
import { UploadIcon } from './components/icons/UploadIcon';

const App: React.FC = () => {
  const [images, setImages] = useState<(UploadedImage | null)[]>([null, null, null, null]);
  const [styleReferenceImage, setStyleReferenceImage] = useState<UploadedImage | null>(null);
  const [studentName, setStudentName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosters, setGeneratedPosters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleImageUpload = (index: number, image: UploadedImage) => {
    const newImages = [...images];
    newImages[index] = { ...image, id: Date.now() + index };
    setImages(newImages);
  };

  const handleStyleReferenceUpload = (_: number, image: UploadedImage) => {
    setStyleReferenceImage({ ...image, id: Date.now() + 5 });
  };
  
  const handleStyleReferenceRemove = () => {
    setStyleReferenceImage(null);
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    const newImages = [...images];
    [newImages[draggedIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[draggedIndex]];
    setImages(newImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const isFormComplete = useMemo(() => {
    const allImagesUploaded = images.every(img => img !== null);
    return allImagesUploaded && studentName.trim() !== '' && instructorName.trim() !== '' && projectName.trim() !== '';
  }, [images, studentName, instructorName, projectName]);

  const handleGenerateClick = async () => {
    if (!isFormComplete) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedPosters([]);

    const validImages = images.filter((img): img is UploadedImage => img !== null);

    try {
      const panoramicResult = await generateA0PosterSeries(validImages, styleReferenceImage, studentName, instructorName, projectName);
      if (panoramicResult) {
        // Slice the panoramic image into 4 posters
        const panoramicImage = new Image();
        panoramicImage.onload = () => {
          const { width, height } = panoramicImage;
          const panelWidth = width / 4;
          const slicedPosters: string[] = [];

          for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = panelWidth;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                panoramicImage,
                i * panelWidth, 0, panelWidth, height, // Source rect
                0, 0, panelWidth, height // Destination rect
              );
              slicedPosters.push(canvas.toDataURL('image/png').split(',')[1]);
            }
          }
          setGeneratedPosters(slicedPosters);
        };
        panoramicImage.src = `data:image/png;base64,${panoramicResult}`;
      } else {
        setError('Failed to generate the poster. The result was empty. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setImages([null, null, null, null]);
    setStyleReferenceImage(null);
    setStudentName('');
    setInstructorName('');
    setProjectName('');
    setGeneratedPosters([]);
    setError(null);
    setIsGenerating(false);
  };

  const handleDownload = (base64Data: string, index: number) => {
    const safeProjectName = projectName.replace(/\s+/g, '_') || 'Project';
    downloadBase64Image(base64Data, `A0-Poster-${safeProjectName}-${index + 1}.png`);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">Studio Poster Builder Pro+</h1>
          <p className="mt-2 text-lg text-gray-400">AI Layout Engine for Dar AlUloom University, Interior Design Department</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            {generatedPosters.length === 0 && !isGenerating && (
                 <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2 text-white">1. Provide Project Details</h2>
                        <p className="text-gray-400 mb-4">Fill in all project information to begin.</p>
                        <div className="space-y-4">
                            <TextInput label="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g., Noura Al-Fahad" />
                            <TextInput label="Instructor Name" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} placeholder="e.g., Dr. Ahmed Khan" />
                            <TextInput label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g., Modern Urban Oasis" />
                        </div>
                    </div>
                     <div>
                        <h2 className="text-2xl font-semibold mb-4 text-white">2. Upload 4 Boards & Optional Style Reference</h2>
                        <p className="text-gray-400 mb-4">Upload your four drawings. Drag and drop to reorder their left-to-right sequence.</p>
                        <div className="grid grid-cols-2 gap-4">
                            {images.map((image, index) => (
                              <ImageUploader
                                key={image?.id || index}
                                index={index}
                                image={image}
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                                isBeingDragged={draggedIndex === index}
                                label={<>Panel {index + 1}</>}
                                icon={<UploadIcon className="w-8 h-8 mb-2" />}
                              />
                            ))}
                        </div>
                         <div className="mt-6">
                            <p className="text-gray-400 mb-2">Click the icon below to provide an optional reference image for the background style.</p>
                             <div className="w-1/2 pr-2">
                                <ImageUploader
                                    index={4}
                                    image={styleReferenceImage}
                                    onImageUpload={handleStyleReferenceUpload}
                                    onImageRemove={handleStyleReferenceRemove}
                                    label={<>Style Reference</>}
                                    icon={<StyleIcon className="w-8 h-8 mb-2" />}
                                />
                             </div>
                        </div>
                    </div>
                     <div className="mt-6">
                        <Button onClick={handleGenerateClick} disabled={!isFormComplete || isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate 4 A0 Posters'}
                        </Button>
                    </div>
                 </div>
            )}
           {(isGenerating || generatedPosters.length > 0 || error) && (
                <div className="flex flex-col items-center justify-center h-full">
                     {isGenerating && <Spinner />}
                     {error && !isGenerating && <p className="text-red-400 text-center">{error}</p>}
                     {generatedPosters.length > 0 && !isGenerating && (
                        <div className='text-center w-full'>
                           <h2 className="text-2xl font-semibold mb-4 text-white">Your Posters are Ready!</h2>
                           <p className="text-gray-400 mb-6">Your series of four A0 posters has been generated. Download them from the preview panel or start over.</p>
                           <Button onClick={handleReset} className="!bg-gray-600 hover:!bg-gray-700">Start a New Project</Button>
                        </div>
                     )}
                </div>
            )}
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[60vh] lg:min-h-full">
            {isGenerating && (
                 <div className="text-center">
                    <Spinner />
                    <p className="mt-4 text-cyan-400 animate-pulse">Designing your A0 poster series... this may take some time.</p>
                </div>
            )}
            {error && !isGenerating && (
              <div className="text-center text-red-400">
                <p>An error occurred:</p>
                <p className="font-mono bg-gray-700 p-2 rounded mt-2 text-sm">{error}</p>
                 <Button onClick={handleReset} className="mt-4">Try Again</Button>
              </div>
            )}
            {generatedPosters.length > 0 && !isGenerating && (
              <div className="w-full text-center flex flex-col h-full">
                <div className="grid grid-cols-4 gap-4">
                  {generatedPosters.map((poster, index) => (
                    <div key={index} className="relative group w-full mx-auto">
                      <img src={`data:image/png;base64,${poster}`} alt={`Generated A0 Poster ${index + 1}`} className="w-full h-auto object-contain shadow-lg rounded-md" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center rounded-md">
                        <button
                            onClick={() => handleDownload(poster, index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-700"
                            aria-label={`Download poster ${index + 1}`}
                        >
                          <DownloadIcon className="w-6 h-6" />
                          <span>Poster {index + 1}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-gray-400 italic">Interior Design Studio Poster Series — Dar AlUloom University</p>
              </div>
            )}
            {generatedPosters.length === 0 && !isGenerating && !error && (
              <div className="text-center text-gray-500">
                <p className="text-2xl">Your generated A0 posters will appear here.</p>
                <p>Complete all fields and upload 4 drawings to begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
