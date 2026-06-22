export interface NativeData {
  _segment: string[]
  brand: string
  custtype: string
  deviceType: string
  platform: string
  transaction_id: string
}

export type DataFactory<U> = (nativeData: NativeData) => U | void

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: DataFactory<any> | BodyInit | Record<string, any> | null
  logger?: ILogger
}

interface NativeResult {
  headers: Record<string, string>
  nativeData: NativeData
}

export async function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const activeLogger = options.logger || logger
  const baseUrl = import.meta.env.VITE_BASE_API_URL || ''
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

  const getNativeInfo = (): Promise<NativeResult> => {
    return new Promise((resolve) => {
      const defaultNativeData: NativeData = {
        _segment: [],
        brand: '',
        custtype: '',
        deviceType: '',
        platform: '',
        transaction_id: '',
      }

      const sdk = window.wx || window.tcsas

      if (!sdk || typeof sdk.invokeNativePlugin !== 'function') {
        activeLogger.add(
          'WARN',
          `[request] SDK not found (wx: ${!!window.wx}, tcsas: ${!!window.tcsas}), skipping native headers`,
        )
        resolve({ headers: {}, nativeData: defaultNativeData })
        return
      }

      activeLogger.add('DEBUG', `[request] Calling getHeadersAPI for: ${fullUrl}`)

      let isResolved = false
      const safeResolve = (data: NativeResult) => {
        if (!isResolved) {
          isResolved = true
          resolve(data)
        }
      }

      const timeoutId = setTimeout(() => {
        activeLogger.add('WARN', `[request] getHeadersAPI timed out, skipping native headers`)
        safeResolve({ headers: {}, nativeData: defaultNativeData })
      }, 1500)

      try {
        sdk.invokeNativePlugin({
          api_name: 'getHeadersAPI',
          data: {
            appId: getAppId(),
            url: fullUrl,
            payload: {},
          },
          success: (res: any) => {
            clearTimeout(timeoutId)
            const headers: Record<string, string> = {}
            let nativeData = { ...defaultNativeData }

            if (res && res.data) {
              const {
                AccessAuthorization,
                accessauthorization,
                AuthServer,
                authserver,
                HASH,
                hash,
                Cookie = {},
                cookies = {},
                'X-REQUESTED-WITH': xReq1,
                'X-Requested-With': xReq2,
                segment,
                custType,
                serviceType,
                brand,
                ...rest
              } = res.data

              const mappedAccessAuth = accessauthorization || AccessAuthorization
              if (mappedAccessAuth) headers['accessauthorization'] = mappedAccessAuth

              const mappedAuthServer = AuthServer || authserver
              if (mappedAuthServer) headers['AuthServer'] = mappedAuthServer

              const mappedHash = hash || HASH
              if (mappedHash) headers['hash'] = mappedHash

              const mappedXReq = xReq1 || xReq2
              if (mappedXReq) headers['X-REQUESTED-WITH'] = mappedXReq

              const currentCookie = Object.keys(cookies).length > 0 ? cookies : Cookie
              if (currentCookie.identifierEnc || currentCookie.serviceEnc) {
                const _cookies = {
                  identifierEnc: currentCookie.identifierEnc,
                  serviceEnc: currentCookie.serviceEnc,
                  defaultIdentifier: currentCookie.identifierEnc,
                }
                headers['Cookie'] = Object.entries(_cookies)
                  .map(([k, v]) => `${k}=${v}`)
                  .join('; ')
              }

              for (const [key, value] of Object.entries(rest)) {
                if (typeof value === 'string' && value) {
                  headers[key] = value
                }
              }

              const _segment = Array.isArray(segment)
                ? segment
                : typeof segment === 'string' && segment
                  ? segment.split(',')
                  : []

              nativeData = {
                _segment,
                brand: brand || '',
                custtype: custType || '',
                deviceType: serviceType?.toLocaleLowerCase() || '',
                platform:
                  String(rest.osversion || '')
                    .toLowerCase()
                    .split('|')[0] || '',
                transaction_id: rest.TRANSACTIONID || '',
              }
            }

            activeLogger.add('DEBUG', `[request] Native headers: ${JSON.stringify(Object.keys(headers))}`)
            activeLogger.add(
              'DEBUG',
              `[request] NativeData: txId=${nativeData.transaction_id}, platform=${nativeData.platform}`,
            )
            safeResolve({ headers, nativeData })
          },
          fail: (err: any) => {
            clearTimeout(timeoutId)
            activeLogger.add('ERROR', `[request] getHeadersAPI failed: ${JSON.stringify(err)}`)
            console.error('getHeadersAPI failed', err)
            safeResolve({ headers: {}, nativeData: defaultNativeData })
          },
        })
      } catch (err) {
        clearTimeout(timeoutId)
        activeLogger.add('ERROR', `[request] invokeNativePlugin exception: ${err}`)
        safeResolve({ headers: {}, nativeData: defaultNativeData })
      }
    })
  }

  const { headers: nativeHeaders, nativeData } = await getNativeInfo()

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...nativeHeaders,
  }

  let finalBody: BodyInit | null | undefined = undefined

  if (typeof options.body === 'function') {
    const factoryResult = (options.body as DataFactory<any>)(nativeData)
    const payloadToUse = factoryResult !== undefined ? factoryResult : nativeData
    finalBody = typeof payloadToUse === 'object' ? JSON.stringify(payloadToUse) : String(payloadToUse)
  } else if (options.body !== null && options.body !== undefined) {
    if (
      typeof options.body === 'object' &&
      !(options.body instanceof FormData) &&
      !(options.body instanceof Blob) &&
      !(options.body instanceof ArrayBuffer) &&
      !(options.body instanceof URLSearchParams)
    ) {
      finalBody = JSON.stringify(options.body)
    } else {
      finalBody = options.body as BodyInit
    }
  }

  activeLogger.add('INFO', `[request] ${options.method || 'GET'} ${fullUrl}`)
  activeLogger.add('INFO', `[request] body - ${JSON.stringify(finalBody, null, 2)}`)

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: finalHeaders,
      body: finalBody,
    })

    activeLogger.add('INFO', `[request] Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    activeLogger.add('ERROR', `[request] Fetch failed: ${error}`)
    console.error(`[request error] ${fullUrl}`, error)
    throw error
  }
}
