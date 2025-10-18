import Image from "next/image"
import Link from "next/link"
import React from 'react'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="https://zencoder.ai/hubfs/Logo.svg"
        alt="ZenCoder Logo"
        width={20}
        height={20}
        className="w-7 h-7 object-contain"
      />
      <span className="text-lg font-bold">ZenPortal</span>
    </Link>
  )
}

export default Logo
