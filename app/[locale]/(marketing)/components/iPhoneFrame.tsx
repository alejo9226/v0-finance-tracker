import Image from 'next/image'

type iPhoneFrameProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export default function IPhoneFrame({ src, alt, className = '', priority }: iPhoneFrameProps) {
  return (
    <div
      className={`relative flex justify-center lg:justify-end ${className}`}
      aria-hidden
    >
      <Image
        src={src}
        alt={alt}
        width={390 / 1.4}
        height={844 / 1.4}
        sizes="(max-width: 640px) 260px, 280px"
        className="object-cover object-top"
        priority={priority}
      />
    </div>
  )
}
