// JSON-RPC client that routes all requests through Next.js proxy

interface JsonRpcRequest {
  jsonrpc: '2.0'
  method: string
  params?: any
  id: string | number
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

class JsonRpcClient {
  private requestId: number = 1

  private async makeRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    // Use proxy instead of direct backend call
    const response = await fetch('/api/proxy/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const jsonResponse = await response.json()

    if (jsonResponse.error) {
      throw new Error(
        `JSON-RPC Error ${jsonResponse.error.code}: ${jsonResponse.error.message}`
      )
    }

    return jsonResponse
  }

  async initialize() {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'initialize',
      id: this.requestId++,
    }

    return this.makeRequest(request)
  }

  async listTools(apiToken: string) {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {
        api_token: apiToken,
      },
      id: this.requestId++,
    }

    return this.makeRequest(request)
  }

  async callTool(
    toolName: string,
    toolArguments: Record<string, any>,
    apiToken: string
  ) {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        api_token: apiToken,
        name: toolName,
        arguments: toolArguments,
      },
      id: this.requestId++,
    }

    return this.makeRequest(request)
  }
}

export const jsonRpcClient = new JsonRpcClient()

// Utility function for tool execution that can be used in React hooks
export async function executeToolViaJsonRpc(
  toolName: string,
  parameters: Record<string, any>,
  apiToken: string
) {
  try {
    const response = await jsonRpcClient.callTool(
      toolName,
      parameters,
      apiToken
    )
    return {
      success: true,
      result: response.result,
      error: null,
    }
  } catch (error: any) {
    return {
      success: false,
      result: null,
      error: error.message || 'Tool execution failed',
    }
  }
}

// Function to get tools via JSON-RPC
export async function getToolsViaJsonRpc(apiToken: string) {
  try {
    const response = await jsonRpcClient.listTools(apiToken)
    return {
      success: true,
      data: response.result?.tools || [],
      error: null,
    }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch tools',
    }
  }
}
