'use client';

import { useState } from 'react';
import { RecipeFormData } from '@/types/recipe';
import { Sparkles, Link as LinkIcon, FileText, Loader2, X } from 'lucide-react';

interface AIExtractorProps {
    onExtract: (data: Partial<RecipeFormData>) => void;
    onClose: () => void;
}

export default function AIExtractor({ onExtract, onClose }: AIExtractorProps) {
    const [mode, setMode] = useState<'url' | 'prompt'>('url');
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleExtract = async () => {
        if (!input.trim()) {
            setError('Please enter a URL or description');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/ai/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: mode, content: input }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to extract');
            }

            onExtract(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card p-6 mb-6 bg-gray-50 border-dashed animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">AI Recipe Extractor</h3>
                </div>
                <button onClick={onClose} className="icon-btn">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Paste a URL or describe a recipe and AI will fill out the form.
            </p>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`chip ${mode === 'url' ? 'chip-active' : 'chip-default'}`}
                >
                    <LinkIcon className="w-4 h-4" />
                    From URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('prompt')}
                    className={`chip ${mode === 'prompt' ? 'chip-active' : 'chip-default'}`}
                >
                    <FileText className="w-4 h-4" />
                    From Description
                </button>
            </div>

            {mode === 'url' ? (
                <input
                    type="url"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste a recipe URL..."
                    className="input mb-4"
                />
            ) : (
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the recipe..."
                    rows={4}
                    className="input resize-none mb-4"
                />
            )}

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <button
                type="button"
                onClick={handleExtract}
                disabled={isLoading}
                className="btn btn-primary"
            >
                {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
                ) : (
                    <><Sparkles className="w-4 h-4" /> Extract Recipe</>
                )}
            </button>
        </div>
    );
}
