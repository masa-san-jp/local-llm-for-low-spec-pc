import type { Message } from '../types/chat'
import type { InvocationContext, ModelDescriptor, ModelStatus } from '../types/model'

export interface InferenceClient {
  sendMessage(
    messages: Message[],
    context: InvocationContext,
  ): AsyncGenerator<string>
  getModelStatus(modelId: string): Promise<ModelStatus>
  getAvailableModels(): Promise<ModelDescriptor[]>
  abortGeneration(): void
}
