/**
 * Document Chunking System
 * Provides multiple chunking strategies for RAG pipelines with configurable parameters
 */

export interface ChunkConfig {
  chunkSize: number;
  chunkOverlap: number;
  strategy: 'recursive' | 'semantic' | 'fixed' | 'markdown' | 'sentence';
  separator?: string;
  keepSeparator?: boolean;
  minChunkSize?: number;
  maxChunkSize?: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  index: number;
  totalChunks: number;
  metadata: {
    startChar: number;
    endChar: number;
    chunkSize: number;
    overlap: number;
    strategy: string;
    [key: string]: any;
  };
}

export interface ChunkingResult {
  chunks: DocumentChunk[];
  totalChunks: number;
  avgChunkSize: number;
  strategy: string;
  processingTime: number;
}

/**
 * Default chunking configuration
 */
export const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  chunkSize: 500,
  chunkOverlap: 50,
  strategy: 'recursive',
  keepSeparator: true,
  minChunkSize: 100,
  maxChunkSize: 2000
};

/**
 * Recursive Character Text Splitter
 * Splits text recursively using a hierarchy of separators
 */
export class RecursiveCharacterTextSplitter {
  private config: ChunkConfig;
  private separators: string[];

  constructor(config: Partial<ChunkConfig> = {}) {
    this.config = { ...DEFAULT_CHUNK_CONFIG, ...config };
    this.separators = [
      '\n\n',  // Paragraphs
      '\n',    // Lines
      '. ',    // Sentences
      '! ',
      '? ',
      '; ',
      ': ',
      ', ',
      ' ',     // Words
      ''       // Characters
    ];
  }

  /**
   * Split text recursively
   */
  splitText(text: string): string[] {
    return this._splitTextRecursive(text, this.separators);
  }

  private _splitTextRecursive(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];
    const separator = separators[separators.length - 1];
    let newSeparators: string[] = [];

    for (let i = 0; i < separators.length; i++) {
      const s = separators[i];
      if (s === '') {
        newSeparators = [];
        break;
      }
      if (text.includes(s)) {
        newSeparators = separators.slice(i + 1);
        break;
      }
    }

    const splits = text.split(separator);
    const goodSplits: string[] = [];

    for (const split of splits) {
      if (split.length < this.config.chunkSize) {
        goodSplits.push(split);
      } else {
        if (goodSplits.length > 0) {
          const mergedText = this._mergeSplits(goodSplits, separator);
          finalChunks.push(...mergedText);
          goodSplits.length = 0;
        }

        if (newSeparators.length === 0) {
          finalChunks.push(split);
        } else {
          const otherChunks = this._splitTextRecursive(split, newSeparators);
          finalChunks.push(...otherChunks);
        }
      }
    }

    if (goodSplits.length > 0) {
      const mergedText = this._mergeSplits(goodSplits, separator);
      finalChunks.push(...mergedText);
    }

    return finalChunks;
  }

  private _mergeSplits(splits: string[], separator: string): string[] {
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const split of splits) {
      const splitLength = split.length;
      
      if (currentLength + splitLength + (currentChunk.length > 0 ? separator.length : 0) > this.config.chunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join(separator));
          
          // Handle overlap
          while (currentChunk.length > 0 && currentLength > this.config.chunkOverlap) {
            currentLength -= currentChunk[0].length + separator.length;
            currentChunk.shift();
          }
        }
      }

      currentChunk.push(split);
      currentLength += splitLength + (currentChunk.length > 1 ? separator.length : 0);
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(separator));
    }

    return chunks;
  }
}

/**
 * Semantic Chunker
 * Splits text based on semantic boundaries (paragraphs, sections)
 */
export class SemanticChunker {
  private config: ChunkConfig;

  constructor(config: Partial<ChunkConfig> = {}) {
    this.config = { ...DEFAULT_CHUNK_CONFIG, ...config };
  }

  /**
   * Split text by semantic boundaries
   */
  splitText(text: string): string[] {
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    let currentLength = 0;

    for (const paragraph of paragraphs) {
      const paragraphLength = paragraph.length;

      // If paragraph itself is too long, split by sentences
      if (paragraphLength > this.config.chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
          currentLength = 0;
        }

        const sentences = this._splitIntoSentences(paragraph);
        chunks.push(...this._chunkSentences(sentences));
        continue;
      }

      // Check if adding this paragraph would exceed chunk size
      if (currentLength + paragraphLength > this.config.chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Handle overlap
        const sentences = this._splitIntoSentences(currentChunk);
        const overlapSentences = this._getOverlapSentences(sentences);
        currentChunk = overlapSentences.join(' ') + '\n\n' + paragraph;
        currentLength = currentChunk.length;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentLength = currentChunk.length;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length >= (this.config.minChunkSize || 0));
  }

  private _splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  private _chunkSentences(sentences: string[]): string[] {
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const sentence of sentences) {
      const sentenceLength = sentence.length;

      if (currentLength + sentenceLength > this.config.chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' ').trim());
        
        // Handle overlap
        const overlapSentences = this._getOverlapSentences(currentChunk);
        currentChunk = [...overlapSentences, sentence];
        currentLength = currentChunk.join(' ').length;
      } else {
        currentChunk.push(sentence);
        currentLength += sentenceLength;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' ').trim());
    }

    return chunks;
  }

  private _getOverlapSentences(sentences: string[]): string[] {
    const overlap: string[] = [];
    let overlapLength = 0;

    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];
      if (overlapLength + sentence.length <= this.config.chunkOverlap) {
        overlap.unshift(sentence);
        overlapLength += sentence.length;
      } else {
        break;
      }
    }

    return overlap;
  }
}

/**
 * Fixed Size Chunker
 * Simple fixed-size chunking with overlap
 */
export class FixedSizeChunker {
  private config: ChunkConfig;

  constructor(config: Partial<ChunkConfig> = {}) {
    this.config = { ...DEFAULT_CHUNK_CONFIG, ...config };
  }

  /**
   * Split text into fixed-size chunks
   */
  splitText(text: string): string[] {
    const chunks: string[] = [];
    const { chunkSize, chunkOverlap } = this.config;
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const chunk = text.slice(startIndex, endIndex);
      
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }

      startIndex += chunkSize - chunkOverlap;
      
      if (startIndex >= text.length) {
        break;
      }
    }

    return chunks;
  }
}

/**
 * Markdown-Aware Chunker
 * Preserves markdown structure while chunking
 */
export class MarkdownChunker {
  private config: ChunkConfig;

  constructor(config: Partial<ChunkConfig> = {}) {
    this.config = { ...DEFAULT_CHUNK_CONFIG, ...config };
  }

  /**
   * Split markdown text preserving structure
   */
  splitText(text: string): string[] {
    const sections = this._splitByHeaders(text);
    const chunks: string[] = [];

    for (const section of sections) {
      if (section.content.length <= this.config.chunkSize) {
        chunks.push(section.content);
      } else {
        // Section is too large, split further
        const semantic = new SemanticChunker(this.config);
        const subChunks = semantic.splitText(section.content);
        
        // Add header to each sub-chunk
        const chunksWithHeader = subChunks.map(chunk => 
          section.header ? `${section.header}\n\n${chunk}` : chunk
        );
        
        chunks.push(...chunksWithHeader);
      }
    }

    return chunks;
  }

  private _splitByHeaders(text: string): Array<{ header: string; content: string }> {
    const lines = text.split('\n');
    const sections: Array<{ header: string; content: string }> = [];
    let currentHeader = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for markdown headers
      if (line.match(/^#{1,6}\s/)) {
        if (currentContent.length > 0) {
          sections.push({
            header: currentHeader,
            content: currentContent.join('\n').trim()
          });
          currentContent = [];
        }
        currentHeader = line;
      } else {
        currentContent.push(line);
      }
    }

    // Add final section
    if (currentContent.length > 0) {
      sections.push({
        header: currentHeader,
        content: currentContent.join('\n').trim()
      });
    }

    return sections;
  }
}

/**
 * Sentence-Based Chunker
 * Splits by sentences with configurable size
 */
export class SentenceChunker {
  private config: ChunkConfig;

  constructor(config: Partial<ChunkConfig> = {}) {
    this.config = { ...DEFAULT_CHUNK_CONFIG, ...config };
  }

  /**
   * Split text by sentences
   */
  splitText(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      const sentenceLength = trimmedSentence.length;

      if (currentLength + sentenceLength > this.config.chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        
        // Calculate overlap
        const overlapSentences: string[] = [];
        let overlapLength = 0;
        
        for (let i = currentChunk.length - 1; i >= 0; i--) {
          if (overlapLength + currentChunk[i].length <= this.config.chunkOverlap) {
            overlapSentences.unshift(currentChunk[i]);
            overlapLength += currentChunk[i].length;
          } else {
            break;
          }
        }
        
        currentChunk = [...overlapSentences, trimmedSentence];
        currentLength = currentChunk.join(' ').length;
      } else {
        currentChunk.push(trimmedSentence);
        currentLength += sentenceLength;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  }
}

/**
 * Main Document Chunker
 * Facade for all chunking strategies
 */
export class DocumentChunker {
  private config: ChunkConfig;

  constructor(config: Partial<ChunkConfig> = {}) {
    this.config = { ...DEFAULT_CHUNK_CONFIG, ...config };
  }

  /**
   * Chunk a document with the configured strategy
   */
  chunk(text: string, additionalMetadata: Record<string, any> = {}): ChunkingResult {
    const startTime = performance.now();
    
    let chunker: RecursiveCharacterTextSplitter | SemanticChunker | FixedSizeChunker | MarkdownChunker | SentenceChunker;
    
    switch (this.config.strategy) {
      case 'semantic':
        chunker = new SemanticChunker(this.config);
        break;
      case 'fixed':
        chunker = new FixedSizeChunker(this.config);
        break;
      case 'markdown':
        chunker = new MarkdownChunker(this.config);
        break;
      case 'sentence':
        chunker = new SentenceChunker(this.config);
        break;
      case 'recursive':
      default:
        chunker = new RecursiveCharacterTextSplitter(this.config);
        break;
    }

    const textChunks = chunker.splitText(text);
    
    // Pre-compute chunk positions in a single pass for O(n) complexity
    // instead of O(n*m) with repeated indexOf calls
    const chunkPositions = this._computeChunkPositions(text, textChunks);
    
    const chunks: DocumentChunk[] = textChunks.map((content, index) => {
      const position = chunkPositions[index];
      return {
        id: this._generateChunkId(index),
        content: content.trim(),
        index,
        totalChunks: textChunks.length,
        metadata: {
          startChar: position.start,
          endChar: position.end,
          chunkSize: content.length,
          overlap: this.config.chunkOverlap,
          strategy: this.config.strategy,
          ...additionalMetadata
        }
      };
    });

    const processingTime = performance.now() - startTime;
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.content.length, 0);
    const avgChunkSize = chunks.length > 0 ? totalSize / chunks.length : 0;

    return {
      chunks,
      totalChunks: chunks.length,
      avgChunkSize: Math.round(avgChunkSize),
      strategy: this.config.strategy,
      processingTime: Math.round(processingTime)
    };
  }

  /**
   * Batch chunk multiple documents
   */
  batchChunk(documents: Array<{ text: string; metadata?: Record<string, any> }>): ChunkingResult[] {
    return documents.map(doc => this.chunk(doc.text, doc.metadata));
  }

  private _generateChunkId(index: number): string {
    return `chunk-${Date.now()}-${index}`;
  }

  /**
   * Compute all chunk positions in a single pass through the text.
   * This is O(n) where n is the text length, instead of O(n*m) with repeated indexOf calls.
   */
  private _computeChunkPositions(fullText: string, chunks: string[]): Array<{ start: number; end: number }> {
    const positions: Array<{ start: number; end: number }> = [];
    let searchStartIndex = 0;
    
    for (const chunk of chunks) {
      const cleanChunk = chunk.trim();
      // Search from the last found position to avoid re-scanning the entire text
      const position = fullText.indexOf(cleanChunk, searchStartIndex);
      
      if (position !== -1) {
        positions.push({ start: position, end: position + cleanChunk.length });
        // Update search start for next chunk (account for overlapping chunks)
        searchStartIndex = Math.max(searchStartIndex, position + 1);
      } else {
        // Fallback: search from beginning if not found after last position
        const fallbackPosition = fullText.indexOf(cleanChunk);
        if (fallbackPosition !== -1) {
          positions.push({ start: fallbackPosition, end: fallbackPosition + cleanChunk.length });
        } else {
          positions.push({ start: 0, end: cleanChunk.length });
        }
      }
    }
    
    return positions;
  }

  // Kept for backward compatibility but marked as deprecated
  /** @deprecated Use _computeChunkPositions for better performance */
  private _calculateStartChar(fullText: string, chunk: string, _index: number): number {
    const cleanChunk = chunk.trim();
    const position = fullText.indexOf(cleanChunk);
    return position !== -1 ? position : 0;
  }

  /** @deprecated Use _computeChunkPositions for better performance */
  private _calculateEndChar(fullText: string, chunk: string, _index: number): number {
    const cleanChunk = chunk.trim();
    const position = fullText.indexOf(cleanChunk);
    return position !== -1 ? position + cleanChunk.length : cleanChunk.length;
  }

  /**
   * Get chunking statistics
   */
  getStats(result: ChunkingResult): {
    totalChunks: number;
    avgChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
    totalCharacters: number;
    strategy: string;
    processingTime: number;
  } {
    const sizes = result.chunks.map(c => c.content.length);
    
    return {
      totalChunks: result.totalChunks,
      avgChunkSize: result.avgChunkSize,
      minChunkSize: Math.min(...sizes),
      maxChunkSize: Math.max(...sizes),
      totalCharacters: sizes.reduce((sum, size) => sum + size, 0),
      strategy: result.strategy,
      processingTime: result.processingTime
    };
  }

  /**
   * Update chunking configuration
   */
  updateConfig(newConfig: Partial<ChunkConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ChunkConfig {
    return { ...this.config };
  }
}

/**
 * Utility function to create a chunker with default settings
 */
export function createChunker(strategy: ChunkConfig['strategy'] = 'recursive', chunkSize = 500, chunkOverlap = 50): DocumentChunker {
  return new DocumentChunker({
    strategy,
    chunkSize,
    chunkOverlap
  });
}

/**
 * Utility function to chunk text with default settings
 */
export function chunkText(text: string, chunkSize = 500, chunkOverlap = 50, strategy: ChunkConfig['strategy'] = 'recursive'): DocumentChunk[] {
  const chunker = new DocumentChunker({ chunkSize, chunkOverlap, strategy });
  return chunker.chunk(text).chunks;
}
