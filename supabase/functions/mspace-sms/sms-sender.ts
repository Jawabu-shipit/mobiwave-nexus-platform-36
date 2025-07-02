
import { MspaceResponse, SendResult } from './types.ts'
import { MspaceErrorHandler } from './enhanced-error-handler.ts'

export async function sendSMSToRecipient(
  recipient: string,
  message: string,
  apiKey: string,
  username: string,
  senderId: string
): Promise<SendResult> {
  const maxRetries = 3;
  let lastError: any;
  let lastError: unknown;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries} for recipient:`, recipient.substring(0, 5) + '...')

      const response = await fetch('https://api.mspace.co.ke/smsapi/v2/sendtext', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          username,
          senderId,
          recipient: recipient.replace(/\D/g, ''),
          message
        })
      })

      const responseData = await response.json() as MspaceResponse
      console.log(`Mspace API response for ${recipient}:`, responseData)

      // Handle successful response
      if (response.ok && responseData.message && Array.isArray(responseData.message)) {
        const messageData = responseData.message.find(msg => msg.recipient === recipient.replace(/\D/g, ''))
        if (messageData) {
          const isSuccess = messageData.status === 111
          return {
            recipient,
            success: isSuccess,
            messageId: messageData.messageId,
            message: isSuccess ? 'Message sent successfully' : messageData.statusDescription,
            error: isSuccess ? undefined : messageData.statusDescription
          }
        }
      }

      // Handle error response
      const enhancedError = MspaceErrorHandler.handleApiError(
        { status: response.status, message: responseData },
        `SMS to ${recipient}`
      );

      if (!MspaceErrorHandler.shouldRetry(enhancedError, attempt, maxRetries)) {
        return {
          recipient,
          success: false,
          message: enhancedError.message,
          error: enhancedError.message
        }
      }

      lastError = enhancedError;
      const delay = MspaceErrorHandler.getRetryDelay(enhancedError, attempt);
      console.log(`Retrying in ${delay}ms due to:`, enhancedError.message);
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for ${recipient}:`, error)
      
      const enhancedError = MspaceErrorHandler.handleApiError(error, `SMS to ${recipient}`);
      
      if (!MspaceErrorHandler.shouldRetry(enhancedError, attempt, maxRetries)) {
        return {
          recipient,
          success: false,
          message: enhancedError.message,
          error: enhancedError.message
        }
      }

      lastError = enhancedError;
      if (attempt < maxRetries - 1) {
        const delay = MspaceErrorHandler.getRetryDelay(enhancedError, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  return {
    recipient,
    success: false,
    message: 'All retry attempts failed',
    error: lastError?.message || 'Maximum retries exceeded'
    error: typeof lastError === 'object' && lastError !== null && 'message' in lastError
      ? (lastError as { message: string }).message
      : 'Maximum retries exceeded'
    error: typeof lastError === 'object' && lastError !== null && 'message' in lastError
      ? (lastError as { message: string }).message
      : 'Maximum retries exceeded'
  }
}
