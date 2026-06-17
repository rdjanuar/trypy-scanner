
export interface EmvcoResult {
  valid: boolean
  parsed?: Record<string, string>
  reason?: string
}

function crc16(str: string) {
  let crc = 0xffff

  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

function parseTLV(qr: string) {
  const result: Record<string, string> = {}
  let i = 0

  while (i < qr.length - 4) {
    const tag = qr.substring(i, i + 2)
    const len = parseInt(qr.substring(i + 2, i + 4), 10)

    if (Number.isNaN(len)) break

    const value = qr.substring(i + 4, i + 4 + len)
    result[tag] = value

    i += 4 + len
  }

  return result
}

export function validateCRC(qr: string) {
  const data = qr.slice(0, -4)
  const crc = qr.slice(-4)
  return crc16(data) === crc
}

export function validateEmvcoQR(qr: string): EmvcoResult {
  if (!qr || qr.length < 10)
    return { valid: false, reason: 'QR kosong / terlalu pendek' }

  const parsed = parseTLV(qr)

  if (!parsed['00'])
    return { valid: false, reason: 'Payload indicator tidak ada' }

  if (!parsed['63']) return { valid: false, reason: 'CRC tag tidak ada' }

  // if (!validateCRC(qr)) return { valid: false, reason: 'CRC tidak valid' }

  if (parsed['58'] && parsed['58'] !== 'ID')
    return { valid: false, reason: 'Bukan QR Indonesia' }

  return {
    valid: true,
    parsed
  }
}


export type Decode = (
  params: { data: string },
  options?: Partial<{
    onSucess: VoidFunction
    logger: ILogger,
  }>
) => Promise<void>


function getIdentifier() {
  try {
    let data = window.wx.getStorageSync('account-binding-storage');
    if (data) {
      if (typeof data === 'object' && data.data) data = data.data;
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsedData?.state?.activeAcc?.identifier) {
        return parsedData.state.activeAcc.identifier;
      }
    }
  } catch (error) {
  }

  try {
    let data = window.wx.getStorageSync('msisdn');
    if (data) {
      if (typeof data === 'object' && data.data) data = data.data;
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsedData?.msisdn) {
        return parsedData.msisdn;
      }
    }
  } catch (error) {
  }

  return undefined;
}



export const decode: Decode = async (params, options = {}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentInfo = urlParams.get('payment_info')
  const validateQr = validateEmvcoQR(params.data)
  const activeLogger = options.logger ?? logger

  if(!validateQr.valid) {
    alert(validateQr.reason || 'QR Tidak Valid')
    return
  }


  const result = await request('aggregator/payment-methods/qr/decode', {
    method: "POST",
    body: (nativeData) => ({
       channel: 'i1',
        transaction_id: nativeData?.transaction_id,
        customer_details: {
          customer_phone: getIdentifier()
        },
        payment_info: {
          payment_provider: paymentInfo,
          qr_string: params.data
        },
    }),
    logger: activeLogger
  })
  
  activeLogger.add('DEBUG', `Result - qr decode$ ${JSON.stringify(result, null, 2)}`)

  alert(JSON.stringify(result))
    
  const url = result?.data?.raw?.payment_response?.checkout_url

  if(url) {
    options?.onSucess?.()
    window.location.replace = url
  }

}