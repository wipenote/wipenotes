import * as _ from 'lodash'

const _valueMapper = '0123456789abcdef'
const _indexMapper = {}
_.forEach(_valueMapper, (elem, idx) => (_indexMapper[elem] = idx))

/**
 * Encodes a single byte in the range [0, 255]
 */
export const encodeByte = (byteValue) => {
  const fourBits = 15
  const eightBits = 255
  const upperFourBits = eightBits - fourBits
  return (
    _valueMapper[(byteValue & upperFourBits) >> 4] +
    _valueMapper[byteValue & fourBits]
  )
}

/**
 * Decodes a single byte string
 */
export const decodeByte = (byteValue) => {
  return _indexMapper[byteValue[0]] * 16 + _indexMapper[byteValue[1]]
}

/**
 * Converts an array of numbers in the range [0, 255] to a hex string 0x"01234...DEF".
 */
export const hexEncode = (hexValues) => {
  const hexified = hexValues.map(encodeByte)
  return hexified.join('')
}

/**
 * Converts a hex string to an array of numbers.
 */
export const hexDecode = (hexString) => {
  const splitByByte = hexString.match(/.{1,2}/g)
  return splitByByte.map(decodeByte)
}
