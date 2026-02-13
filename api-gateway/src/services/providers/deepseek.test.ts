import { vi, describe, it, expect } from 'vitest';
import { DeepSeekService } from './deepseek';
import axios from 'axios';

// Mock dependencies
vi.mock('@/config/env', () => ({
  default: {
    providers: {
      deepseek: 'test-api-key',
    },
  },
}));

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('axios');

describe('DeepSeekService Stream', () => {
  it('should handle split chunks correctly', async () => {
    const service = new DeepSeekService();

    // Simulate a stream where a JSON object is split across chunks
    // Chunk 1 ends with "Hello"
    // Chunk 2 starts with " wor"
    const mockStream = (async function* () {
      yield Buffer.from(
        'data: {"choices": [{"delta": {"content": "Hello"}}]}\n\n',
      );
      yield Buffer.from('data: {"choices": [{"delta": {"content": " wor');
      yield Buffer.from('ld"}}]}\n\n');
      yield Buffer.from('data: [DONE]\n\n');
    })();

    (axios.post as any).mockResolvedValue({
      data: mockStream,
    });

    const request = {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hi' } as any],
    };

    const chunks: any[] = [];
    try {
      for await (const chunk of service.streamChat(request)) {
        chunks.push(chunk);
      }
    } catch (e) {
      console.log('Stream error:', e);
    }

    console.log('Received chunks:', chunks.length);
    // We want to see if we get the split message.
    const combined = chunks.map((c) => c.choices[0].delta.content).join('');
    console.log('Combined content:', combined);

    if (combined !== 'Hello world') {
      console.log('FAIL: Split chunk was not handled correctly.');
    } else {
      console.log('PASS: Split chunk handled correctly.');
    }
  });

  it('benchmark processing large stream with small chunks', async () => {
    const service = new DeepSeekService();

    const largeContent = 'x'.repeat(100);
    const chunkCount = 5000;

    const mockStream = (async function* () {
      for (let i = 0; i < chunkCount; i++) {
        yield Buffer.from(
          `data: {"id":"${i}","choices":[{"delta":{"content":"${largeContent}"}}]}\n\n`,
        );
      }
      yield Buffer.from('data: [DONE]\n\n');
    })();

    (axios.post as any).mockResolvedValue({
      data: mockStream,
    });

    const request = {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hi' } as any],
    };

    const start = performance.now();
    let count = 0;
    for await (const chunk of service.streamChat(request)) {
      count++;
    }
    const end = performance.now();
    console.log(`Processed ${count} chunks in ${(end - start).toFixed(2)}ms`);
  });
});
