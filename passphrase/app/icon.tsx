import { ImageResponse } from 'next/og'
import Favicon from './favicon.svg'
//@ts-ignore
import { theme } from '../tailwind.config.ts'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse((<Favicon width="32" height="32" fill={theme.colors.logo}/>), {...size})
}
