
interface OperationConfig {
  operation: string;
  username: string;
  clientname?: string;
  noOfSms?: number;
}

export function getEndpointAndPayload(config: OperationConfig) {
  const { operation, username, clientname, noOfSms } = config;
  
  let endpoint = '';
  type Payload =
    | { username: string }
    | { username: string; subaccname: string; noOfSms: number }
    | { username: string; clientname: string; noOfSms: number };

  let payload: Payload = { username };
  
  switch(operation) {
    case 'subAccounts':
    case 'querysubs':
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/subusers';
      break;
    case 'resellerClients':
    case 'queryresellerclients':
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/resellerclients';
      break;
    case 'topUpSubAccount':
    case 'topupsub':
      if (!clientname || !noOfSms) {
        throw new Error('Client name and SMS quantity required for top-up');
      }
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/subacctopup';
      payload = {
        username,
        subaccname: clientname,
        noOfSms
      };
      break;
    case 'topUpResellerClient':
    case 'topupresellerclient':
      if (!clientname || !noOfSms) {
        throw new Error('Client name and SMS quantity required for top-up');
      }
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/resellerclienttopup';
      payload = {
        username,
        clientname,
        noOfSms
      };
      break;
    default:
      throw new Error(`Invalid operation: ${operation}`);
  }

  return { endpoint, payload };
}

export function buildGetUrl(operation: string, endpoint: string, apiKey: string, username: string, clientname?: string, noOfSms?: number) {
  switch(operation) {
    case 'subAccounts':
    case 'querysubs':
    case 'resellerClients':
    case 'queryresellerclients':
      return `${endpoint}?apikey=${apiKey}&username=${username}`;
    case 'topUpSubAccount':
    case 'topupsub':
      return `${endpoint}?apikey=${apiKey}&username=${username}&subaccname=${clientname}&noofsms=${noOfSms}`;
    case 'topUpResellerClient':
    case 'topupresellerclient':
      return `${endpoint}?apikey=${apiKey}&username=${username}&clientname=${clientname}&noofsms=${noOfSms}`;
    default:
      throw new Error(`GET URL not supported for operation: ${operation}`);
  }
}
