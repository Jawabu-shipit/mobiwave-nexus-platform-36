
import { getEndpointAndPayload, buildGetUrl } from './operations.ts';

interface ApiRequestConfig {
  operation: string;
  username: string;
  apiKey: string;
  clientname?: string;
  noOfSms?: number;
}

export async function makeApiRequest(config: ApiRequestConfig) {
  const { endpoint, payload } = getEndpointAndPayload(config);

  console.log('Processing operation:', config.operation, 'for user:', config.username);
<<<<<<< HEAD
<<<<<<< HEAD
=======
  console.log('Endpoint:', endpoint);
  console.log('Payload:', JSON.stringify(payload));
>>>>>>> 7144a38 (second commit)
=======
  console.log('Endpoint:', endpoint);
  console.log('Payload:', JSON.stringify(payload));
>>>>>>> 364714e (change commit)

  // Try POST method first (more reliable according to docs)
  try {
    const postResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': config.apiKey
      },
      body: JSON.stringify(payload)
    });

<<<<<<< HEAD
<<<<<<< HEAD
=======
    console.log('POST response status:', postResponse.status, postResponse.statusText);

>>>>>>> 7144a38 (second commit)
=======
    console.log('POST response status:', postResponse.status, postResponse.statusText);

>>>>>>> 364714e (change commit)
    if (postResponse.ok) {
      const responseText = await postResponse.text();
      console.log('POST response:', responseText);
      
      try {
        return JSON.parse(responseText);
      } catch {
        return { message: responseText, status: 'success' };
      }
    } else {
<<<<<<< HEAD
<<<<<<< HEAD
      throw new Error(`POST request failed: ${postResponse.status} ${postResponse.statusText}`);
=======
      const errorText = await postResponse.text();
      console.log('POST error response:', errorText);
      throw new Error(`POST request failed: ${postResponse.status} ${postResponse.statusText} - ${errorText}`);
>>>>>>> 7144a38 (second commit)
=======
      const errorText = await postResponse.text();
      console.log('POST error response:', errorText);
      throw new Error(`POST request failed: ${postResponse.status} ${postResponse.statusText} - ${errorText}`);
>>>>>>> 364714e (change commit)
    }
  } catch (postError) {
    console.log('POST method failed, trying GET method:', postError);
    
    return await tryGetMethod(config, endpoint);
  }
}

async function tryGetMethod(config: ApiRequestConfig, endpoint: string) {
  const { operation, apiKey, username, clientname, noOfSms } = config;
  
  const getUrl = buildGetUrl(operation, endpoint, apiKey, username, clientname, noOfSms);
<<<<<<< HEAD
<<<<<<< HEAD
  const getResponse = await fetch(getUrl);

  if (!getResponse.ok) {
    throw new Error(`Both POST and GET requests failed. Last error: ${getResponse.status} ${getResponse.statusText}`);
=======
=======
>>>>>>> 364714e (change commit)
  console.log('GET URL:', getUrl);
  
  const getResponse = await fetch(getUrl);
  console.log('GET response status:', getResponse.status, getResponse.statusText);

  if (!getResponse.ok) {
    const errorText = await getResponse.text();
    console.log('GET error response:', errorText);
    throw new Error(`Both POST and GET requests failed. Last error: ${getResponse.status} ${getResponse.statusText} - ${errorText}`);
<<<<<<< HEAD
>>>>>>> 7144a38 (second commit)
=======
>>>>>>> 364714e (change commit)
  }

  const responseText = await getResponse.text();
  console.log('GET response:', responseText);
  
  try {
    return JSON.parse(responseText);
  } catch {
    return { message: responseText, status: 'success' };
  }
}
